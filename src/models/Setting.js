import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["department", "category"],
    required: true,
  },
  value: { type: String, required: true }, 
});

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);