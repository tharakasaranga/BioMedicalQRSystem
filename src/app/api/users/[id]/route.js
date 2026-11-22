import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

async function verifySuperAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.role === "super_admin" ? payload : null;
}


export async function PATCH(req, { params }) {
  try {
    const admin = await verifySuperAdmin(req);
    if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true }).select("-password");
    return NextResponse.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  try {
    const admin = await verifySuperAdmin(req);
    if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await connectDB();
    const { id } = await params;

    if (admin.userId === id) {
      return NextResponse.json({ message: "You cannot delete your own Super Admin account" }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User removed" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}