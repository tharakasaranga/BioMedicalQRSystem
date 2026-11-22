import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden: Super Admin only" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, "-password").sort({ isApproved: 1, createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}