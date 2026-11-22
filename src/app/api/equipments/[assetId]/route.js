import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Equipment from "@/models/Equipment";
import Fault from "@/models/Fault";
import { calculateEquipmentStock } from "@/lib/equipmentStock";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { assetId } = await params;

    const equipment = await Equipment.findOne({ assetId });
    if (!equipment) {
      return NextResponse.json({ message: "Equipment not found" }, { status: 404 });
    }

  
    const faults = await Fault.find({ equipment: equipment._id })
      .populate("reportedBy", "name role")
      .sort({ createdAt: -1 });

    const stock = calculateEquipmentStock(equipment, faults);
    return NextResponse.json({
      equipment: { ...equipment.toObject(), ...stock },
      faults,
    });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching equipment details", error: error.message }, { status: 500 });
  }
}