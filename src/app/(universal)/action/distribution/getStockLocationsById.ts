"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { VehicleType } from "@/lib/types/distribution/VehicleType";

export async function getStockLocationById(
  id: string
): Promise<VehicleType | null> {

 
  try {
    const doc = await adminDb
      .collection("stockLocations")
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }
 
    return doc.data() as VehicleType;
  } catch (error) {
    console.error("❌ getStockLocationById:", error);
    return null;
  }
}