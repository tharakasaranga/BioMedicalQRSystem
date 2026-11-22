import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, role, department } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? "super_admin" : role || "staff",
      department: department || "General",
      isApproved: isFirstUser ? true : false,
    });

    return NextResponse.json(
      {
        message: isFirstUser
          ? "Super Admin account created! You can login now."
          : "Registration successful! Please wait for Super Admin approval before logging in.",
        isFirstUser,
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Error registering user", error: error.message }, { status: 500 });
  }
}