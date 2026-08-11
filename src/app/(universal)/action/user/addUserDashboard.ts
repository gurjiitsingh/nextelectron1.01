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

  const password = String(formData.get("password") || "").trim();

  const role = String(formData.get("role") || "user").trim().toLowerCase();

  const status = String(formData.get("status") || "active")
    .trim()
    .toLowerCase();

  const employeeId = String(formData.get("employeeId") || "").trim();

  const department = String(formData.get("department") || "")
    .trim()
    .toUpperCase();

  const address = String(formData.get("address") || "").trim();

  const notes = String(formData.get("notes") || "").trim();

  // Optional fields
  const branchId = String(formData.get("branchId") || "MAIN").trim();

  const allowPosLogin =
    String(formData.get("allowPosLogin") || "true") === "true";

  const pin = String(formData.get("pin") || "").trim();

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

    // Optional PIN hashing
    const hashedPin = pin ? await hashPassword(pin) : "";

    const permissions = {
      sale: true,

      refund: role === "admin" || role === "manager",

      discount: role === "admin" || role === "manager",

      editPrice: role === "admin",

      inventory:
        role === "admin" ||
        role === "manager" ||
        department === "STORE",

      reports: role === "admin" || role === "manager",

      production:
        role === "admin" ||
        department === "PRODUCTION",

      settings: role === "admin",

      manageUsers: role === "admin",
    };

    const docRef = await adminDb.collection("users").add({
      fullName,
      username,
      email,
      mobile,

      hashedPassword,
      hashedPin,
      loginPin: "123456",
      allowPosLogin: true,
      role,
      department,

      employeeId,
      branchId,

      status,
      active: status === "active",

      

      permissions,

      address,
      notes,

      isVerified: true,

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