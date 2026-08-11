import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";



export async function getCustomerAccount(
  customerId: string 
) {

 
  if (!customerId) return null;

  const doc = await adminDb
    .collection("customerAccounts") 
    .doc(customerId)
    .get();

  if (!doc.exists) return null;

  const data = doc.data();

  return {
    customerId,

    ...data,

    updatedAt:
      data?.updatedAt?.toDate?.()?.toISOString() ??
      null,

    createdAt:
      data?.createdAt?.toDate?.()?.toISOString() ??
      null,
  };
}