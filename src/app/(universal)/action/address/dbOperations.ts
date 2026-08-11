'use server';

import { adminDb } from "@/lib/firebaseAdmin";
import {
  addressResT,
  addressResType,
  addressSchima,
  addressSchimaCheckout,
  addressWithId,
} from "@/lib/types/addressType";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

//  Add new address (basic)
export async function addNewAddress(formData: FormData) {
  const receivedData = {
    name: formData.get("name")?.toString(),
    userId: formData.get("userId")?.toString(),
    mobNo: formData.get("mobNo")?.toString(),
    addressLine1: formData.get("addressLine1")?.toString(),
    addressLine2: formData.get("addressLine2")?.toString(),
    city: formData.get("city")?.toString(),
    state: formData.get("state")?.toString(),
    zipCode: formData.get("zipCode")?.toString(),
  };

  const result = addressSchima.safeParse(receivedData);
  if (!result.success) return;

  await adminDb.collection("address").add({
    ...receivedData,
    createdAt: FieldValue.serverTimestamp(),
  });
}

//  Edit address by email
export async function editCustomerAddress(formData: FormData) {
  const receivedData = {
    email: formData.get("email")?.toString(),
    firstName: formData.get("firstName")?.toString(),
    lastName: formData.get("lastName")?.toString(),
    userId: formData.get("userId")?.toString(),
    mobNo: formData.get("mobNo")?.toString(),
    password: formData.get("password")?.toString(),
    addressLine1: formData.get("addressLine1")?.toString(),
    addressLine2: formData.get("addressLine2")?.toString(),
    city: formData.get("city")?.toString(),
    state: formData.get("state")?.toString(),
    zipCode: formData.get("zipCode")?.toString(),
  };

  const result = addressSchimaCheckout.safeParse(receivedData);
  if (!result.success || !receivedData.email) return;

  const querySnapshot = await adminDb
    .collection("address")
    .where("email", "==", receivedData.email)
    .get();

  const docRefId = querySnapshot.docs[0]?.id;
  if (docRefId) {
    await adminDb.collection("address").doc(docRefId).update(result.data);
  }
}

//  Search address by email
export async function searchAddressEmail(email: string): Promise<addressResType | null> {
if (!email) return null;

const value = email.trim();
 const field = value.includes("@") ? "email" : "mobNo";
  const querySnapshot = await adminDb
    .collection("address")
     .where(field, "==", value)
   // .where("email", "==", email)
    .get();

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  const docData = doc.data();

  return {
    id: doc.id,
    addressLine1: docData.addressLine1 || '',
    addressLine2: docData.addressLine2 || '',
    city: docData.city || '',
    state: docData.state || '',
    zipCode: docData.zipCode || '',
    email: docData.email || '',
    firstName: docData.firstName || '',
    lastName: docData.lastName || '',
    mobNo: docData.mobNo || '',
    userId: docData.userId || '',
    createdAt: docData.createdAt?.toDate().toISOString() || '',
  };
}

export async function findAddressByMob(
  mobNo: string
): Promise<addressResType | null> {

  const querySnapshot = await adminDb
    .collection("address")
    .where("mobNo", "==", mobNo)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  const docData = doc.data();

  return {
    id: doc.id,
    addressLine1: docData.addressLine1 || "",
    addressLine2: docData.addressLine2 || "",
    city: docData.city || "",
    state: docData.state || "",
    zipCode: docData.zipCode || "",
    email: docData.email || "",
    firstName: docData.firstName || "",
    lastName: docData.lastName || "",
    mobNo: docData.mobNo || "",
    userId: docData.userId || "",
    createdAt: docData.createdAt?.toDate().toISOString() || "",
  };
}


//  Get address by ID (returns with ID)
export async function searchAddressByAddressId(id: string): Promise<addressWithId> {
  const docSnap = await adminDb.collection("address").doc(id).get();
  if (!docSnap.exists) throw new Error("No such address document");
 
  const raw = docSnap.data() as addressResT;
  const createdAtStr =
    raw.createdAt instanceof Timestamp
      ? raw.createdAt.toDate().toISOString()
      : new Date().toISOString();

  return {
    ...raw,
    createdAt: createdAtStr,
    id: docSnap.id,
  };
}



//  Get order master by ID
export async function fetchOrderMasterById(id: string) {
  const docSnap = await adminDb.collection("orderMaster").doc(id).get();
  if (!docSnap.exists) return null;

  const raw = docSnap.data();
  const createdAtStr =
    raw?.createdAt instanceof Timestamp
      ? raw.createdAt.toDate().toISOString()
      : new Date().toISOString();

  return {
    ...raw,
    createdAt: createdAtStr,
    id: docSnap.id,
  };
}

//  Search address by userId
export const searchAddressByUserId = async (id: string | undefined): Promise<addressResT> => {
  if (!id) return {} as addressResT;

  const querySnapshot = await adminDb
    .collection("address")
    .where("userId", "==", id)
    .get();

  const data = querySnapshot.docs[0]?.data() as addressResT;
  return data || ({} as addressResT);
};

//  Add customer address if not exists
export async function addCustomerAddressDirect(formData: FormData) {
  const receivedData = {
    email: formData.get("email")?.toString(),
    firstName: formData.get("firstName")?.toString(),
    lastName: formData.get("lastName")?.toString(),
    userId: formData.get("userId")?.toString(),
    mobNo: formData.get("mobNo")?.toString(),
    password: formData.get("password")?.toString(),
    addressLine1: formData.get("addressLine1")?.toString(),
    addressLine2: formData.get("addressLine2")?.toString(),
    city: formData.get("city")?.toString(),
    state: formData.get("state")?.toString(),
    zipCode: formData.get("zipCode")?.toString(),
  };

  const result = addressSchimaCheckout.safeParse(receivedData);
  if (!result.success || !receivedData.email) return null;

  const querySnapshot = await adminDb
    .collection("address")
    .where("email", "==", receivedData.email)
    .get();

  const recordId = querySnapshot.docs[0]?.id;

  if (!recordId) {
    const addressData = {
      ...receivedData,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("address").add(addressData);
    return docRef.id;
  }

  return recordId;
}


export async function addCustomerAddressDirectPrimaryMOB(
  formData: FormData
): Promise<string | null> {

  const receivedData = {
    email: formData.get("email")?.toString() || "dummy@maill.com",
    firstName: formData.get("firstName")?.toString() || "",
    lastName: formData.get("lastName")?.toString() || "",
    userId: formData.get("userId")?.toString() || "",
    mobNo: formData.get("mobNo")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    addressLine1: formData.get("addressLine1")?.toString() || "",
    addressLine2: formData.get("addressLine2")?.toString() || "",
    city: formData.get("city")?.toString() || "",
    state: formData.get("state")?.toString() || "",
    zipCode: formData.get("zipCode")?.toString() || "",
  };

  // 🛡 Validate (ZIP optional)
  const result = addressSchimaCheckout.safeParse(receivedData);
  if (!result.success || !receivedData.mobNo) return null;

  // 🔍 1️⃣ Search address by mobile number
  const querySnapshot = await adminDb
    .collection("address")
    .where("mobNo", "==", receivedData.mobNo)
    .limit(1)
    .get();

  const recordId = querySnapshot.docs[0]?.id;

  // 📦 2️⃣ If address exists → return existing id
  if (recordId) return recordId;

  // ✍️ 3️⃣ Otherwise create new
  const addressData = {
    ...receivedData,
    createdAt: FieldValue.serverTimestamp(),
  };

  const docRef = await adminDb.collection("address").add(addressData);

  return docRef.id;
}
