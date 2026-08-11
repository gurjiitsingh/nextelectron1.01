"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { tableDataT } from "@/lib/types/tableType";
import admin from "firebase-admin";








export async function deleteTable(tableId: string) {
  try {
    if (!tableId) {
      return { success: false, error: "Invalid table id" };
    }

    const ref = adminDb.collection("tables").doc(tableId);
    const doc = await ref.get();

    if (!doc.exists) {
      return { success: false, error: "Table not found" };
    }

    const data = doc.data();

    // ❗ Prevent deleting active table
    if (data?.status !== "AVAILABLE") {
      return { success: false, error: "Table is in use" };
    }

    await ref.delete();

    console.log(`🗑️ Deleted table ${tableId}`);

    revalidatePath("/admin/settings/tables");

    return { success: true };
  } catch (error) {
    console.error("❌ Delete failed:", error);
    return { success: false, error: "Failed to delete table" };
  }
}



export async function getTables(): Promise<tableDataT[]> {
  const snapshot = await adminDb.collection("tables").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: data.id ?? doc.id,
      tableName: data.tableName ?? doc.id,
      status: data.status ?? "AVAILABLE",
      waiterName: data.waiterName ?? "",
      waiterId: data.waiterId ?? "",
      activeOrderId: data.activeOrderId ?? "",
      guestsCount: data.guestsCount ?? 0,
      area: data.area ?? "General", // ✅ added
      sortOrder: data.sortOrder ?? 0, // ✅ added
      createdAt:
        data.createdAt?.toDate?.() ??
        (data.createdAt ?? null),
      updatedAt:
        data.updatedAt?.toDate?.() ??
        (data.updatedAt ?? null),
      notes: data.notes ?? "",
      synced: data.synced ?? false,
    } as tableDataT;
  });
}




export async function saveTables(formData: FormData) {
  try {
    const tableCount = Number(formData.get("tableCount") || 0);
    const area = String(formData.get("area") || "General");
    const tablePrefix = String(formData.get("tablePrefix") || "Table");

    if (!tableCount || tableCount <= 0) {
      return { success: false, error: "Invalid table count" };
    }

    // ✅ STEP 1: Get existing tables of this area
    const snapshot = await adminDb
      .collection("tables")
      .where("area", "==", area)
      .get();

    const batch = adminDb.batch();

    // ✅ STEP 2: Delete old tables (ONLY if safe)
    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // ❗ Prevent deleting running tables
      if (data.status !== "AVAILABLE") {
        throw new Error("❌ Cannot overwrite active tables");
      }

      batch.delete(doc.ref);
    });

    // ✅ STEP 3: Create fresh tables (fixed count)
    for (let i = 1; i <= tableCount; i++) {
      const id = `${area.replace(/\s+/g, "_")}_${tablePrefix}_${i}`;
      const ref = adminDb.collection("tables").doc(id);

      batch.set(ref, {
        id,
        tableName: `${tablePrefix} ${i}`,
        area,
        sortOrder: i,
        status: "AVAILABLE",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        synced: true,
      });
    }

    // ✅ STEP 4: Commit all at once (FAST + SAFE)
    await batch.commit();

    revalidatePath("/admin/settings/tables");

    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to save tables:", error);
    return { success: false, error: error.message || "Failed to create tables" };
  }
}


// export async function saveTables(formData: FormData) {
//   try {
//     const tableCount = Number(formData.get("tableCount") || 0);
//     const area = String(formData.get("area") || "General");
//     const tablePrefix = String(formData.get("tablePrefix") || "Table");

//     if (!tableCount || tableCount <= 0) {
//       return { success: false, error: "Invalid table count" };
//     }

//     // ✅ Get existing tables for this specific area
//     const existingSnapshot = await adminDb
//       .collection("tables")
//       .where("area", "==", area)
//       .get();

//     // ✅ Sort manually (to avoid Firestore index requirement)
//     const existingTables = existingSnapshot.docs
//       .map((d) => d.data() as tableDataT)
//       .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

//     const existingCount = existingTables.length;

//     // ✅ Create new tables
//     for (let i = 1; i <= tableCount; i++) {
//       const id = `${area.replace(/\s+/g, "_")}_${tablePrefix}_${i}`;
//       const sortOrder = existingCount + i; // area-specific order continues from last one

//       const tableData: Partial<tableDataT> = {
//         id,
//         tableName: `${tablePrefix} ${i}`,
//         area,
//         sortOrder,
//         status: "AVAILABLE",
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         synced: true,
//       };

//       await adminDb.collection("tables").doc(id).set(tableData, { merge: true });
//       console.log(`✅ Added ${tablePrefix} ${i} in ${area}`);
//     }

//     revalidatePath("/admin/settings/tables");
//     return { success: true };
//   } catch (error) {
//     console.error("❌ Failed to save tables:", error);
//     return { success: false, error: "Failed to create tables" };
//   }
// }
