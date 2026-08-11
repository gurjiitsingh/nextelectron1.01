import { revalidatePath, revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

import { InventoryCategory } from "@/lib/types/InventoryCategory";

export async function fetchInventoryCategories(): Promise<
  InventoryCategory[]
> {
  const snapshot =
    await adminDb
      .collection("inventoryCategories")
      .orderBy("sortOrder", "asc")
      .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,

      createdAt: data.createdAt
        ? data.createdAt.toDate().toISOString()
        : null,

      updatedAt: data.updatedAt
        ? data.updatedAt.toDate().toISOString()
        : null,
    };
  }) as InventoryCategory[];
}