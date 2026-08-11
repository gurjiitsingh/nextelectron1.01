"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

type FieldName =
  | "cashInHand"
  | "cashInBank"
  | "expenseDue"
  | "loans";

export async function updateBusinessField(
  field: FieldName,
  value: number
) {
  try {
    await adminDb
      .collection("businessFinancials")
      .doc("main")
      .set(
        {
          [field]: Number(value),

          updatedAt:
            admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

    // revalidateTag("businessFinancials");
    // revalidatePath("/admin/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to update.",
    };
  }
}