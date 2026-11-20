import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import Fault from "@/models/Fault";
import Equipment from "@/models/Equipment";

function calculatePriority({ isCriticalEquipment, deviceStoppedWorking, department }) {
  const criticalDepts = ["ICU", "EMERGENCY", "THEATRE", "NICU", "CCU"];
  const isCriticalWard = criticalDepts.includes(department?.toUpperCase());

  if (deviceStoppedWorking || isCriticalEquipment || isCriticalWard) {
    return "High";
  }

  return "Medium";
}


export async function GET() {
  try {
    await connectDB();
    const faults = await Fault.find({})
      .populate("equipment", "assetId name department category status")
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });


    const priorityWeight = { High: 1, Medium: 2, Low: 3 };
    const sortedFaults = faults.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

    return NextResponse.json({ faults: sortedFaults });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch faults" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    await connectDB();

    
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Please login to report a fault" }, { status: 401 });
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const { equipmentId, issueDescription, isCriticalEquipment, deviceStoppedWorking, isMinorCosmetic } = await req.json();

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return NextResponse.json({ message: "Equipment not found" }, { status: 404 });
    }

   
    let priority = "Low";
    if (!isMinorCosmetic) {
      priority = calculatePriority({
        isCriticalEquipment,
        deviceStoppedWorking,
        department: equipment.department,
      });
    }

    const newFault = await Fault.create({
      equipment: equipment._id,
      reportedBy: payload.userId,
      issueDescription,
      isCriticalEquipment,
      deviceStoppedWorking,
      priority,
      status: "Pending",
    });

   
    equipment.status = deviceStoppedWorking ? "Out of Order" : "Under Maintenance";
    await equipment.save();

    return NextResponse.json({ message: "Fault reported successfully", fault: newFault }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error reporting fault", error: error.message }, { status: 500 });
  }
}