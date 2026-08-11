// app/api/setup-admin/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    return NextResponse.json({ adminExists: !snapshot.empty });
  } catch (error: any) {
    console.error("GET /setup-admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Add Firestore record with admin role
    await adminDb.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role: "admin",
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Admin created successfully!" });
  } catch (error: any) {
    console.error("POST /setup-admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
