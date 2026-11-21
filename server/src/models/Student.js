import mongoose from "mongoose";
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, unique: true },
  course: { type: String, default: "BCA" },
  semester: { type: String, default: "1st" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.model("Student", studentSchema);
