"use server";

 

 


"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { UnitConversion } from "@/lib/types/UnitConversion";

export async function getUnitConversions(): Promise<UnitConversion[]> {
  try {
    const snapshot = await adminDb
      .collection("inventoryUnitConversions")
      .orderBy("purchaseUnit")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        purchaseUnit: data.purchaseUnit || "",
        consumptionUnit: data.consumptionUnit || "",
        factor: Number(data.factor || 1),
        isActive: data.isActive ?? true,
        system: data.system ?? false,
        type: data.type ?? "CUSTOM",
        isEditable: data.isEditable ?? true,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}



// export async function getUnitConversions(): Promise<UnitConversion[]> {
//   try {
//     const snapshot = await adminDb
//       .collection("inventoryUnitConversions")
//       .orderBy("purchaseUnit")
//       .get();

//     const firestoreUnits: UnitConversion[] =
//       snapshot.docs.map((doc) => {
//         const data = doc.data();

//         return {
//           id: doc.id,

//           purchaseUnit: data.purchaseUnit || "",
//           consumptionUnit:
//             data.consumptionUnit || "",

//           factor: Number(data.factor || 1),

//           isActive:
//             data.isActive ?? true,

//           system:
//             data.system ?? false,

//           createdAt: data.createdAt
//             ? data.createdAt
//                 .toDate()
//                 .toISOString()
//             : null,

//           updatedAt: data.updatedAt
//             ? data.updatedAt
//                 .toDate()
//                 .toISOString()
//             : null,
//         };
//       });

//     const universalUnits: UnitConversion[] =
//       UNIVERSAL_UNIT_CONVERSIONS.map(
//         (item, index) => ({
//           id: `universal-${index}`,

//           purchaseUnit:
//             item.purchaseUnit,

//           consumptionUnit:
//             item.consumptionUnit,

//           factor: item.factor,

//           isActive: true,
//           system: true,

//           type: "UNIVERSAL",
//           isEditable: false,

//           createdAt: null,
//           updatedAt: null,
//         })
//       );

//     return [
//       ...universalUnits,
//       ...firestoreUnits,
//     ];
//   } catch (error) {
//     console.error(error);

//     return UNIVERSAL_UNIT_CONVERSIONS.map(
//       (item, index) => ({
//         id: `universal-${index}`,

//         purchaseUnit:
//           item.purchaseUnit,

//         consumptionUnit:
//           item.consumptionUnit,

//         factor: item.factor,

//         isActive: true,
//         system: true,

//         type: "UNIVERSAL",
//         isEditable: false,

//         createdAt: null,
//         updatedAt: null,
//       })
//     );
//   }
// }