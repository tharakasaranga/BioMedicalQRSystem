import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Equipment from "@/models/Equipment";
import Fault from "@/models/Fault";
import { calculateEquipmentStock } from "@/lib/equipmentStock";

export async function GET() {
  try {
    await connectDB();
    const equipments = await Equipment.find({}).sort({ createdAt: -1 });
    const faults = await Fault.find({ status: { $ne: "Resolved" } });
    const faultsByEquipment = new Map();

    for (const fault of faults) {
      const equipmentId = fault.equipment.toString();
      const equipmentFaults = faultsByEquipment.get(equipmentId) || [];
      equipmentFaults.push(fault);
      faultsByEquipment.set(equipmentId, equipmentFaults);
    }

    const equipmentWithStock = equipments.map((equipment) => ({
      ...equipment.toObject(),
      ...calculateEquipmentStock(
        equipment,
        faultsByEquipment.get(equipment._id.toString()) || []
      ),
    }));

    return NextResponse.json({ equipments: equipmentWithStock });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch equipments" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const assetId = body.assetId?.trim() || `BIO-${new Date().getFullYear()}-${randomNum}`;

    const existing = await Equipment.findOne({ assetId });
    if (existing) {
      return NextResponse.json({ message: "Asset ID already exists" }, { status: 400 });
    }

    const totalQty = Math.max(1, Number(body.quantity) || 1);

    const newEquipment = await Equipment.create({
      assetId,
      name: body.name,
      category: body.category,
      department: body.department,
      serialNumber: body.serialNumber,
      manufacturer: body.manufacturer || "N/A",
      quantity: totalQty,
      operationalQty: totalQty, 
      maintenanceQty: 0,
      outOfOrderQty: 0,
      status: body.status || "Operational",
    });

    return NextResponse.json({ equipment: newEquipment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to add equipment", error: error.message }, { status: 500 });
  }
}