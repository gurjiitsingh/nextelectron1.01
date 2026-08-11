import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

// export async function getSupplierAccount(
//   supplierId: string
// ) {
//   const doc = await adminDb
//     .collection("supplierAccounts")
//     .doc(supplierId)
//     .get();

//   if (!doc.exists) return null;

//   return doc.data() as SupplierAccountType;
// }




export async function getSupplierAccount(
  supplierId: string
) {
  if (!supplierId) return null;

  const doc = await adminDb
    .collection("supplierAccounts")
    .doc(supplierId)
    .get();

  if (!doc.exists) return null;

  const data = doc.data();

  return {
    supplierId,

    ...data,

    updatedAt:
      data?.updatedAt?.toDate?.()?.toISOString() ??
      null,

    createdAt:
      data?.createdAt?.toDate?.()?.toISOString() ??
      null,
  };
}