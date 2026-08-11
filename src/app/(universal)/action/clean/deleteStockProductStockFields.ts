"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { fetchProductsStock } from "../products/fetchProductsStock";
 
 

export async function deleteStockLocations() {
  try {
    const snapshot = await adminDb
      .collection('stockLocation')
      .get();

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      message: `Deleted ${snapshot.size} documents from stockLocation collection.`,
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message:
        error.message || 'Failed to delete collection.',
    };
  }
}
// export async function deleteStockLocations() {

//   try {
// console.log("adding stock--------------------------------")
//     const products = await fetchProductsStock();


//     if (products.length === 0) {
//       return {
//         success: true,
//         message: "No products found",
//         updated: 0,
//       };
//     }


//     const batch = adminDb.batch();


//     const addQuantity = 200;


//     for (const product of products) {


//       const locationType = "STORE";
//       const locationRef = "MAIN";


//       const stockLocationId =
//         `${product.id}_${locationType}_${locationRef}`;


//       const stockLocationDoc =
//         adminDb
//           .collection("stockLocation")
//           .doc(stockLocationId);



//       const existing =
//         await stockLocationDoc.get();



//       if (existing.exists) {


//         // ADD STOCK
//         batch.update(stockLocationDoc, {

//           quantity:
//             admin.firestore.FieldValue.increment(addQuantity),

//           updatedAt: Date.now(),

//         });


//       } else {


//         // CREATE STOCK LOCATION

//         batch.set(stockLocationDoc, {

//           id: stockLocationId,

//           productId: product.id,

//           productName: product.name,


//           productMode:
//             product.productMode === "simple"
//               ? "finished_stock"
//               : product.productMode,


//           locationType,

//           locationRef,


//           quantity: addQuantity,


//           sellingPrice:
//             product.sellingPrice ?? 0,


//           wholesalePrice:
//             product.wholesalePrice ?? 0,


//           costPrice:
//             product.costPrice ?? 0,


//           avgCost:
//             product.avgCost ?? 0,


//           updatedAt: Date.now(),

//         });

//       }

//     }


//     await batch.commit();


//     return {

//       success: true,

//       message:
//         `Added ${addQuantity} qty to MAIN STORE for ${products.length} products`,

//       updated: products.length,

//     };


//   } catch (error: any) {


//     console.error(
//       "❌ Failed adding dummy stock locations:",
//       error
//     );


//     return {

//       success: false,

//       message:
//         error.message ||
//         "Failed to add dummy stock locations",

//     };

//   }

// }