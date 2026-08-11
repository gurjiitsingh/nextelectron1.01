import { adminDb } from "@/lib/firebaseAdmin";




export async function fetchInventoryItemSuppliersAll() {
  try {
    const snapshot = await adminDb
      .collection("inventoryItemSuppliers")
      .get();

    const result = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const mapping = doc.data();

        const supplierDoc = await adminDb
          .collection("suppliers")
          .doc(mapping.supplierId)
          .get();

        const supplierData = supplierDoc.exists
          ? supplierDoc.data()
          : null;

        return {
          id: doc.id,
          inventoryItemId: mapping.inventoryItemId,

          supplier: supplierData
            ? {
                id: supplierDoc.id,

                // optional but safe if you want readable dates
                createdAt:
                  supplierData.createdAt?.toDate?.()?.toISOString() ?? null,

                updatedAt:
                  supplierData.updatedAt?.toDate?.()?.toISOString() ?? null,

                ...supplierData,
              }
            : null,
        };
      })
    );

    // ✅ FINAL SAFETY LAYER (IMPORTANT)
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}