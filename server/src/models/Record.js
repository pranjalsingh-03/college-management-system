import mongoose from "mongoose";
const schema = new mongoose.Schema({
  module: { type: String, required: true, index: true },
  fields: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
export default mongoose.model("Record", schema);
