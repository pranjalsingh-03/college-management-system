import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  studentName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Present", "Absent", "Leave"], required: true }
}, { timestamps: true });
export default mongoose.model("Attendance", attendanceSchema);
