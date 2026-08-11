"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { VehicleType } from "@/lib/types/distribution/VehicleType";



export async function getVehicles(): Promise<VehicleType[]> {
  const data: VehicleType[] = [];

  const snapshot = await adminDb
    .collection("stockLocations")
    .where("active", "==", true)
    .orderBy("name")
    .get();

  snapshot.forEach((doc) => {
    const d = doc.data();

    data.push({
      id: doc.id,

      locationCode: d.locationCode,
      name: d.name,
      type: d.type,

      responsiblePersonId: d.responsiblePersonId,
      responsiblePersonName: d.responsiblePersonName,

      capacity: d.capacity,

      remarks: d.remarks,

      active: d.active,
      createdAt: d.createdAt,
  updatedAt: d.updatedAt,
    });
  });

  return data;
}