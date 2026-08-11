"use server";

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { userType } from "@/lib/types/userType";
import { userDashboardType } from "@/lib/types/userDashboardType";

export async function fetchAllUsers(): Promise<userDashboardType[]> {
  const data: userDashboardType[] = [];

  const snapshot = await adminDb
    .collection("users")
    .orderBy("createdAt", "desc")
    .get();

  snapshot.forEach((doc) => {
    const docData = doc.data();

    data.push({
      id: doc.id,

      fullName: docData.fullName || "",
      username: docData.username || "",

      email: docData.email || "",
      mobile: docData.mobile || "",

      hashedPassword:
        docData.hashedPassword || "",

      role: docData.role || "user",
      status: docData.status || "active",

      isAdmin:
        docData.isAdmin ?? false,

      isVerfied:
        docData.isVerified ?? false,

      employeeId:
        docData.employeeId || "",

      department:
        docData.department || "",

      address:
        docData.address || "",

      notes:
        docData.notes || "",

      createdAt:
        docData.createdAt?.toDate?.()
          ?.toISOString() || undefined,

      updatedAt:
        docData.updatedAt?.toDate?.()
          ?.toISOString() || undefined,
    });
  });

  return data;
}