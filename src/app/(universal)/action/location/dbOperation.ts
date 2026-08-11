// /app/(universal)/action/location/dbOperation.ts
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { locationType } from "@/lib/types/locationType";
import { FieldValue } from "firebase-admin/firestore";




export async function addNewLocation(formData: FormData) {
  try {
    const name = (formData.get("name") as string || "").trim();

    // 🔥 NORMALIZED SEARCH FIELD
    const searchName = name.toLowerCase().replace(/\s+/g, "");

    const deliveryFee = Number(formData.get("deliveryFee"));
    const minSpend = Number(formData.get("minSpend"));

    const deliveryDistanceRaw = formData.get("deliveryDistance");
    const deliveryDistance =
      deliveryDistanceRaw !== null && deliveryDistanceRaw !== ""
        ? Number(deliveryDistanceRaw)
        : null;

    const docRef = await adminDb.collection("locations").add({
      name,
      searchName,   // 👈 store normalized field

      city: formData.get("city"),
      state: formData.get("state"),

      deliveryFee,
      minSpend,
      deliveryDistance,

      notes: formData.get("notes") ?? "",

      createdAt: FieldValue.serverTimestamp(),
    });

    return { id: docRef.id };
  } catch (e) {
    console.error("Error adding location:", e);
    return { errors: true };
  }
}






export async function fetchLocations() {
  const snapshot = await adminDb
    .collection("locations")
    .orderBy("name")
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name ?? "",

      //  ADD THIS
      searchName: data.searchName ?? "",

      city: data.city ?? "",
      state: data.state ?? "",
      deliveryFee: Number(data.deliveryFee ?? 0),
      minSpend: Number(data.minSpend ?? 0),
      deliveryDistance:
        data.deliveryDistance !== undefined
          ? Number(data.deliveryDistance)
          : null,
      notes: data.notes ?? "",
      createdAt: data.createdAt?.toMillis?.() ?? null,
    };
  });
}





export async function deleteLocation(id: string) {
  await adminDb.collection("locations").doc(id).delete();
}



export async function getLocationById(id: string): Promise<locationType | null> {
  const doc = await adminDb.collection("locations").doc(id).get();

  if (!doc.exists) return null;

  const data = doc.data()!;

  return {
    id: doc.id,
    name: data.name,
    city: data.city,
    state: data.state,
    deliveryFee: Number(data.deliveryFee),
    minSpend: Number(data.minSpend),
    deliveryDistance: data.deliveryDistance ?? null,
    notes: data.notes ?? "",
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}

export async function getLocationByName(
  name: string
): Promise<locationType | null> {

  // 🔥 normalize input the same way you stored it
  const searchKey = name.toLowerCase().replace(/\s+/g, "");

  console.log("searchKey ----------", searchKey);

  const snapshot = await adminDb
    .collection("locations")
    .where("searchName", "==", searchKey)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name,
    city: data.city,
    state: data.state,
    deliveryFee: Number(data.deliveryFee),
    minSpend: Number(data.minSpend),
    deliveryDistance:
      data.deliveryDistance !== undefined
        ? Number(data.deliveryDistance)
        : null,
    notes: data.notes ?? "",
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}



export async function updateLocation(id: string, formData: FormData) {
  await adminDb.collection("locations").doc(id).update({
    name: formData.get("name"),
    city: formData.get("city"),
    state: formData.get("state"),
    deliveryFee: Number(formData.get("deliveryFee")),
    minSpend: Number(formData.get("minSpend")),
    deliveryDistance:
      formData.get("deliveryDistance")
        ? Number(formData.get("deliveryDistance"))
        : null,
    notes: formData.get("notes") ?? "",
  });

  return { success: true };
}
