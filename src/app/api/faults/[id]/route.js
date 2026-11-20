import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fault from "@/models/Fault";
import Equipment from "@/models/Equipment";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status, technicianNotes } = await req.json();

    const updatedFault = await Fault.findByIdAndUpdate(
      id,
      { status, technicianNotes },
      { new: true }
    );

    if (!updatedFault) {
      return NextResponse.json({ message: "Fault not found" }, { status: 404 });
    }

    if (status === "Resolved") {
      const remainingFaults = await Fault.countDocuments({
        equipment: updatedFault.equipment,
        status: { $ne: "Resolved" },
      });

      if (remainingFaults === 0) {
        await Equipment.findByIdAndUpdate(updatedFault.equipment, {
          status: "Operational",
          lastMaintenanceDate: new Date(),
        });
      }
    } else if (status === "In Progress") {
      await Equipment.findByIdAndUpdate(updatedFault.equipment, {
        status: "Under Maintenance",
      });
    }

    return NextResponse.json({ message: "Fault updated", fault: updatedFault });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update fault", error: error.message }, { status: 500 });
  }
}