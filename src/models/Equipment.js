import mongoose from "mongoose";

const EquipmentSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    serialNumber: { type: String, required: true },
    manufacturer: { type: String },
    quantity: { type: Number, default: 1 },
    operationalQty: { type: Number }, 
    maintenanceQty: { type: Number, default: 0 }, 
    outOfOrderQty: { type: Number, default: 0 }, 
    status: {
      type: String,
      enum: ["Operational", "Under Maintenance", "Out of Order"],
      default: "Operational",
    },
    lastMaintenanceDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Equipment || mongoose.model("Equipment", EquipmentSchema);