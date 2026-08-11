import { adminDb } from "@/lib/firebaseAdmin";




export async function fetchInventoryItemSuppliers(
  inventoryItemId: string
) {
  try {
    const snapshot =
      await adminDb
        .collection(
          "inventoryItemSuppliers"
        )
        .where(
          "inventoryItemId",
          "==",
          inventoryItemId
        )
        .get();

    const suppliers =
      await Promise.all(
        snapshot.docs.map(
          async (doc) => {
            const mapping =
              doc.data();

            const supplierDoc =
              await adminDb
                .collection(
                  "suppliers"
                )
                .doc(
                  mapping.supplierId
                )
                .get();

            return {
              id: doc.id,

              ...mapping,

              supplier:
                supplierDoc.exists
                  ? {
                      id:
                        supplierDoc.id,
                      ...supplierDoc.data(),
                    }
                  : null,
            };
          }
        )
      );

    return suppliers;
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item suppliers:",
      error
    );

    return [];
  }
}


// export async function fetchInventoryItemSuppliers(
//   inventoryItemId: string
// ) {
//   try {
//     const snapshot =
//       await adminDb
//         .collection(
//           "inventoryItemSuppliers"
//         )
//         .where(
//           "inventoryItemId",
//           "==",
//           inventoryItemId
//         )
//         .get();

//     const supplierIds =
//       snapshot.docs.map(
//         (doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })
//       );

//     return supplierIds;
//   } catch (error) {
//     console.error(
//       "❌ Error fetching inventory item suppliers:",
//       error
//     );

//     return [];
//   }
// }