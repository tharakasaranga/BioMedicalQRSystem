import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

export async function GET() {
  try {
    await connectDB();
    const settings = await Setting.find({}).sort({ value: 1 });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    await connectDB();
    const { type, value } = await req.json();

    if (!type || !value?.trim()) {
      return NextResponse.json({ message: "Type and value are required" }, { status: 400 });
    }

    const exists = await Setting.findOne({ type, value: { $regex: new RegExp(`^${value.trim()}$`, "i") } });
    if (exists) {
      return NextResponse.json({ message: "This item already exists" }, { status: 400 });
    }

    const newSetting = await Setting.create({ type, value: value.trim() });
    return NextResponse.json({ setting: newSetting }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error saving setting" }, { status: 500 });
  }
}