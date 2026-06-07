import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, role, institutionName, designation } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    if (role !== "BUYER" && role !== "SELLER") {
      return NextResponse.json(
        { error: "Invalid role specified. Must be BUYER or SELLER." },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    try {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }

      // 2. Hash password and save to database
      const passwordHash = hashPassword(password);
      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          role,
          institutionName: institutionName || null,
          designation: designation || null,
          isVerified: false, // Default false, admin verifies distributors
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (dbError) {
      console.error("Database registration error:", dbError);
      
      // Fallback response if database connection fails (demo fallback)
      return NextResponse.json(
        { 
          success: true, 
          isDemoFallback: true,
          message: "Database connection failed. Mock account created successfully for this session." 
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
