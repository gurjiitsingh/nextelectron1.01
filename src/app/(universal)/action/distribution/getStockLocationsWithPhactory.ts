"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";

type Props = {
  vehicleId: string;
};

export async function getLoadVehicleStock({
  vehicleId,
}: Props): Promise<{
  factoryStock: StockLocationType[];
  vanStock: StockLocationType[];
}> {
  try {
    const factoryQuery = adminDb
      .collection("stockLocation")
      .where("locationType", "==", "FACTORY")
      .where("locationRef", "==", "MAIN")
      .orderBy("productName");

    const vanQuery = adminDb
      .collection("stockLocation")
      .where("locationType", "==", "TRUCK")
      .where("locationRef", "==", vehicleId)
      .orderBy("productName");

    const [factorySnap, vanSnap] = await Promise.all([
      factoryQuery.get(),
      vanQuery.get(),
    ]);

    return {
      factoryStock: factorySnap.docs.map(
        (doc) => doc.data() as StockLocationType
      ),

      vanStock: vanSnap.docs.map(
        (doc) => doc.data() as StockLocationType
      ),
    };
  } catch (error) {
    console.error("❌ getLoadVehicleStock:", error);

    return {
      factoryStock: [],
      vanStock: [],
    };
  }
}