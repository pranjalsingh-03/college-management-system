import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";
import Attendance from "./src/models/Attendance.js";
import Record from "./src/models/Record.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());


app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Please enter a message." });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message: "Gemini API key is missing. Add GEMINI_API_KEY to server/.env and restart the backend."
      });
    }
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const contents = [
      ...history.slice(-12).filter(item => item && ["user", "model"].includes(item.role) && item.text)
        .map(item => ({ role: item.role, parts: [{ text: String(item.text) }] })),
      { role: "user", parts: [{ text: message.trim() }] }
    ];
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are Campus AI, a friendly and helpful college assistant. Help students and college staff with academic explanations, study planning, programming, project guidance, and general college-related questions. Use clear, practical language. Do not claim to access private college records unless provided in the conversation." }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
        })
      }
    );
    const result = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const detail = result?.error?.message || "Gemini API request failed.";
      return res.status(geminiResponse.status).json({ message: detail });
    }
    const reply = result?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!reply) return res.status(502).json({ message: "The AI returned an empty response. Please try again." });
    res.json({ reply, model });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ message: "Unable to reach the AI service. Please try again." });
  }
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "College Management API" }));

app.get("/api/students", async (_req, res) => {
  try { res.json(await Student.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get("/api/attendance/summary", async (_req, res) => {
  try {
    const rows = await Attendance.find();
    const total = rows.length || 1;
    const present = rows.filter(x => x.status === "Present").length;
    const absent = rows.filter(x => x.status === "Absent").length;
    const leave = rows.filter(x => x.status === "Leave").length;
    res.json({
      total: rows.length,
      present: Math.round(present / total * 100),
      absent: Math.round(absent / total * 100),
      leave: Math.round(leave / total * 100)
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

const allowedModules = new Set(["Teachers","Classes","Subjects","Attendance","Fees & Finance","Homework","Timetable","Notice Board","Messages","Exams & Results","Study Material"]);
const validModule = (req,res,next) => {
  if (!allowedModules.has(req.params.module)) return res.status(400).json({message:"Unknown module"});
  next();
};
app.get("/api/records/:module", validModule, async (req,res) => {
  try { res.json(await Record.find({module:req.params.module}).sort({createdAt:-1})); }
  catch(e){res.status(500).json({message:e.message});}
});
app.post("/api/records/:module", validModule, async (req,res) => {
  try {
    if (!req.body.fields || typeof req.body.fields!=="object" || Array.isArray(req.body.fields))
      return res.status(400).json({message:"Valid fields are required"});
    res.status(201).json(await Record.create({module:req.params.module,fields:req.body.fields}));
  } catch(e){res.status(400).json({message:e.message});}
});
app.put("/api/records/:module/:id", validModule, async (req,res) => {
  try {
    if (!req.body.fields || typeof req.body.fields!=="object" || Array.isArray(req.body.fields))
      return res.status(400).json({message:"Valid fields are required"});
    const record=await Record.findOneAndUpdate({_id:req.params.id,module:req.params.module},{fields:req.body.fields},{new:true,runValidators:true});
    if(!record)return res.status(404).json({message:"Record not found"});
    res.json(record);
  } catch(e){res.status(400).json({message:e.message});}
});
app.delete("/api/records/:module/:id", validModule, async (req,res) => {
  try {
    const result=await Record.findOneAndDelete({_id:req.params.id,module:req.params.module});
    if(!result)return res.status(404).json({message:"Record not found"});
    res.json({deleted:true});
  } catch(e){res.status(400).json({message:e.message});}
});

// CRUD endpoints for all campus modules. Collections are restricted to the allowlist.
const moduleFields = {
  teachers: ["name","employeeId","department","subject","email","phone"],
  classes: ["name","section","course","semester","room","classTeacher"],
  subjects: ["name","code","course","semester","teacher","credits"],
  attendance: ["studentName","rollNo","className","date","status"],
  fees: ["studentName","rollNo","amount","dueDate","status","paymentMode"],
  homework: ["title","subject","className","dueDate","description","status"],
  timetable: ["day","className","subject","teacher","startTime","endTime","room"],
  notices: ["title","category","date","description"],
  messages: ["sender","recipient","subject","message","date"],
  exams: ["name","subject","className","date","maxMarks","obtainedMarks","studentName"],
  materials: ["title","subject","className","type","url","description"]
};
const moduleModels = {};
for (const [name, fields] of Object.entries(moduleFields)) {
  const definition = Object.fromEntries(fields.map(field => [field, { type: String, default: "" }]));
  moduleModels[name] = mongoose.model("Campus" + name, new mongoose.Schema(definition, {timestamps:true}), "campus_" + name);
}
app.param("moduleName", (req,res,next,name) => {
  if (!moduleModels[name]) return res.status(404).json({message:"Unknown module"});
  next();
});
app.get("/api/modules/:moduleName", async(req,res) => {
  try {res.json(await moduleModels[req.params.moduleName].find().sort({createdAt:-1}).limit(1000));}
  catch(e){res.status(500).json({message:e.message});}
});
app.post("/api/modules/:moduleName", async(req,res) => {
  try {
    const fields = moduleFields[req.params.moduleName];
    const data = Object.fromEntries(fields.map(k=>[k,String(req.body?.[k]??"").slice(0,2000)]));
    res.status(201).json(await moduleModels[req.params.moduleName].create(data));
  } catch(e){res.status(400).json({message:e.message});}
});
app.put("/api/modules/:moduleName/:id", async(req,res) => {
  try {
    const fields=moduleFields[req.params.moduleName];
    const data=Object.fromEntries(fields.map(k=>[k,String(req.body?.[k]??"").slice(0,2000)]));
    const item=await moduleModels[req.params.moduleName].findByIdAndUpdate(req.params.id,data,{new:true,runValidators:true});
    if(!item)return res.status(404).json({message:"Record not found"});
    res.json(item);
  }catch(e){res.status(400).json({message:e.message});}
});
app.delete("/api/modules/:moduleName/:id",async(req,res)=>{
  try {
    const item=await moduleModels[req.params.moduleName].findByIdAndDelete(req.params.id);
    if(!item)return res.status(404).json({message:"Record not found"});
    res.json({deleted:true});
  }catch(e){res.status(400).json({message:e.message});}
});

const port = process.env.PORT || 5000;
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err.message));
} else console.log("MONGO_URI not set — API runs without database connection.");
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
