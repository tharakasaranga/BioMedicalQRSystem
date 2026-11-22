import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fault from "@/models/Fault";
import Equipment from "@/models/Equipment";
import { calculateEquipmentStock } from "@/lib/equipmentStock";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status, technicianNotes } = await req.json();

    const existingFault = await Fault.findById(id);
    if (!existingFault) {
      return NextResponse.json({ message: "Fault not found" }, { status: 404 });
    }

    existingFault.status = status;
    existingFault.technicianNotes = technicianNotes;
    await existingFault.save();

    const equipment = await Equipment.findById(existingFault.equipment);
    if (equipment) {
      const activeFaults = await Fault.find({
        equipment: equipment._id,
        status: { $ne: "Resolved" },
      });
      Object.assign(equipment, calculateEquipmentStock(equipment, activeFaults));
      if (status === "Resolved") {
        equipment.lastMaintenanceDate = new Date();
      }
      await equipment.save();
    }

    return NextResponse.json({ message: "Fault updated", fault: existingFault });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update fault", error: error.message }, { status: 500 });
  }
}