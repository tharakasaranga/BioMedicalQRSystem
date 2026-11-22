import mongoose from "mongoose";

const FaultSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    faultyQuantity: { type: Number, required: true, default: 1 }, 
    issueDescription: { type: String, required: true },
    isCriticalEquipment: { type: Boolean, default: false },
    deviceStoppedWorking: { type: Boolean, default: false },
    isMinorCosmetic: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    technicianNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Fault || mongoose.model("Fault", FaultSchema);