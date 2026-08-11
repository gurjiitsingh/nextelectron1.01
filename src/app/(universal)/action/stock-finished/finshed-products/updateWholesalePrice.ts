"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

type UpdateWholesalePriceInput = {
  id: string;
  wholesalePrice: number | null;
};


export async function updateWholesalePrice({
  id,
  wholesalePrice,
}: UpdateWholesalePriceInput) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Product ID is required",
      };
    }

    const price =
      wholesalePrice === null
        ? null
        : Number(wholesalePrice);


    // ==========================
    // Update Product Stock
    // ==========================

    const productRef = adminDb
      .collection("productStock")
      .doc(id);


    const productSnap = await productRef.get();


    if (!productSnap.exists) {
      return {
        success: false,
        message: "Product not found",
      };
    }


    await productRef.update({
      wholesalePrice: price,
      updatedAt: Date.now(),
    });



    // ==========================
    // Update Stock Locations
    // ==========================

    const stockSnapshot = await adminDb
      .collection("stockLocation")
      .where(
        "productId",
        "==",
        id
      )
      .get();



    if (!stockSnapshot.empty) {

      const batch = adminDb.batch();


      stockSnapshot.forEach((doc) => {

        batch.update(
          doc.ref,
          {
            wholesalePrice: price,
            updatedAt: Date.now(),
          }
        );

      });


      await batch.commit();
    }



    return {
      success: true,
      message:
        "Wholesale price updated successfully",
    };


  } catch (error) {

    console.error(
      "❌ Error updating wholesale price:",
      error
    );


    return {
      success: false,
      message:
        "Failed to update wholesale price",
    };
  }
}

// export async function updateWholesalePrice({
//   id,
//   wholesalePrice,
// }: UpdateWholesalePriceInput) {
//   try {
//     if (!id) {
//       return {
//         success: false,
//         message: "Product ID is required",
//       };
//     }

//     const price =
//       wholesalePrice === null
//         ? null
//         : Number(wholesalePrice);


//     // =========================
//     // Update productStock
//     // =========================

//     const productRef = adminDb
//       .collection("productStock")
//       .doc(id);

//     const productSnap = await productRef.get();

//     if (!productSnap.exists) {
//       return {
//         success: false,
//         message: "Product not found",
//       };
//     }

//     await productRef.update({
//       wholesalePrice: price,
//       updatedAt: Date.now(),
//     });



//     // =========================
//     // Update stockLocations
//     // =========================

//     const stockSnap = await adminDb
//       .collection("stockLocations")
//       .where("productId", "==", id)
//       .get();

// console.log('updateing wholesale price----------------',id)
//     if (!stockSnap.empty) {

//       const batch = adminDb.batch();

//       stockSnap.forEach((doc) => {

//         batch.update(doc.ref, {
//           wholesalePrice: price,
//           updatedAt: Date.now(),
//         });

//       });

//       await batch.commit();
//     }


//     return {
//       success: true,
//       message: "Wholesale price updated successfully",
//     };


//   } catch (error) {
//     console.error(
//       "❌ Error updating wholesale price:",
//       error
//     );

//     return {
//       success: false,
//       message: "Failed to update wholesale price",
//     };
//   }
// }

// export async function updateWholesalePrice({
//   id,
//   wholesalePrice,
// }: UpdateWholesalePriceInput) {
//   try {
//     if (!id) {
//       return {
//         success: false,
//         message: "Product ID is required",
//       };
//     }

//     const docRef = adminDb
//       .collection("productStock")
//       .doc(id);

//     const snap = await docRef.get();

//     if (!snap.exists) {
//       return {
//         success: false,
//         message: "Product not found",
//       };
//     }

//     await docRef.update({
//       wholesalePrice:
//         wholesalePrice === null
//           ? null
//           : Number(wholesalePrice),
//       updatedAt: Date.now(),
//     });

//     // revalidateTag("products", "max");
//     // revalidatePath("/admin/products");
//     //revalidatePath("/admin/stock-finished");

//     return {
//       success: true,
//       message: "Wholesale price updated",
//     };
//   } catch (error) {
//     console.error(
//       "❌ Error updating wholesale price:",
//       error
//     );

//     return {
//       success: false,
//       message: "Failed to update wholesale price",
//     };
//   }
// }