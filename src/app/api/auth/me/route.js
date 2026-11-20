import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      user: {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}