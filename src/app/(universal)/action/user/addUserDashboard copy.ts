"use server";

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function addUserDashboard(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const mobile = String(formData.get("mobile") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "user");
  const status = String(formData.get("status") || "active");
  const employeeId = String(formData.get("employeeId") || "").trim();
  
  const address = String(formData.get("address") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
const department = String(formData.get("department") || "")
  .trim()
  .toUpperCase();
  try {
    if (!fullName || !mobile || !password) {
      return {
        success: false,
        message: "Please fill all required fields.",
      };
    }

    const existing = await adminDb
      .collection("users")
      .where("mobile", "==", mobile)
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        message: "Mobile number is already in use.",
      };
    }

    const hashedPassword = await hashPassword(password);

    const docRef = await adminDb.collection("users").add({
      fullName,
      username,
      email,
      mobile,
      hashedPassword,
      role,
      status,
      isVerified: true,
      isAdmin: role === "admin",
      employeeId,
      department,
      address,
      notes,
      time: new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "User created successfully.",
      userId: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    return {
      success: false,
      message: error.message || "Failed to create user.",
    };
  }
}