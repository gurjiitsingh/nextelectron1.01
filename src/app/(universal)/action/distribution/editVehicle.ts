"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { revalidatePath, revalidateTag } from "next/cache";



export async function updateVehicle({
  id,
  locationCode,
  name,
  type,
  responsiblePersonId,
  responsiblePersonName,
  capacity,
  remarks,
}: VehicleType) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Invalid location.",
      };
    }

    if (!locationCode.trim()) {
      return {
        success: false,
        message: "Location code is required.",
      };
    }

    if (!name.trim()) {
      return {
        success: false,
        message: "Location name is required.",
      };
    }

    // Check duplicate location code (excluding current document)
    const existing = await adminDb
      .collection("stockLocations")
      .where("locationCode", "==", locationCode.trim().toUpperCase())
      .limit(1)
      .get();

    if (!existing.empty && existing.docs[0].id !== id) {
      return {
        success: false,
        message: "Location code already exists.",
      };
    }

    await adminDb
      .collection("stockLocations")
      .doc(id)
      .update({
        locationCode: locationCode.trim().toUpperCase(),
        name: name.trim(),

        type,

        responsiblePersonId: responsiblePersonId || "",
        responsiblePersonName: responsiblePersonName || "",

        capacity: capacity || 0,

        remarks: remarks || "",

        updatedAt: Date.now(),
      });

    revalidateTag("vehicles", "max");
    revalidatePath("/admin/distribution/vehicles");

    return {
      success: true,
      message: "Location updated successfully.",
    };
  } catch (error: any) {
    console.error("❌ updateVehicle:", error);

    return {
      success: false,
      message: error.message || "Failed to update location.",
    };
  }
}