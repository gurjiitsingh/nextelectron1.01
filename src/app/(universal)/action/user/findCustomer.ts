// app/(universal)/action/users/findCustomer.ts

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function findCustomer(identifier: string) {
  const value = identifier.trim();
  console.log("value----------------", value)
  const usersRef = adminDb.collection("users");

  const field = value.includes("@") ? "email" : "phone";

  const snap = await usersRef
  .where("mobNo", "==", value)
  .limit(1)
  .get();
  if (snap.empty) {
   
    return null;
  }

  const data = snap.docs[0].data();

return {
  id: snap.docs[0].id,
  ...data,
  createdAt: data.createdAt?.toDate().toISOString() ?? null,
};
}