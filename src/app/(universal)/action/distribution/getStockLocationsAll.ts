"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { StorageType } from "@/lib/types/distribution/StorageType";

type GetStockLocationsProps = {
  locationType?: StorageType;
  locationRef?: string;
};

export async function getStockLocationsAll({
  locationType,
  locationRef,
}: GetStockLocationsProps = {}): Promise<StockLocationType[]> {

 
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("stockLocation");

    if (locationType) {
      query = query.where("locationType", "==", locationType);
    }

    if (locationRef) {
      query = query.where("locationRef", "==", locationRef);
    }

    query = query.orderBy("productName");

    const snapshot = await query.get();

    return snapshot.docs.map(
      (doc) => doc.data() as StockLocationType
    );
  } catch (error) {
    console.error("❌ getStockLocations:", error);
    return [];
  }
}