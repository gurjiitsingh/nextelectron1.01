import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export type ActiveVehicleTrip = {
  tripId: string;
  tripNo: string;

  vehicleId: string;
  vehicleName: string;

  driverId: string;
  driverName: string;

  routeId: string;
  routeName: string;

  status: string;

  totalLoadedQuantity: number;
  totalLoadedValue: number;

  totalSalesAmount: number;
  totalReturnAmount: number;

  totalCashCollected: number;
  totalCreditAmount: number;

  totalExpenses: number;
  totalAmountHandedOver: number;
  settlementDifference: number;
};

export async function getActiveVehicleTrip(
  tx: admin.firestore.Transaction,
  vehicleId: string
): Promise<ActiveVehicleTrip | null> {

  if (!vehicleId) {
    throw new Error("Vehicle ID is required");
  }

  const snapshot = await tx.get(
    adminDb
      .collection("distributionTrips")
      .where("vehicleId", "==", vehicleId)
      .where("status", "in", ["LOADED", "IN_ROUTE"])
      .limit(1)
  );

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

return {
  tripId: doc.id,

  tripNo: data.tripNo || "",

  vehicleId: data.vehicleId || "",
  vehicleName: data.vehicleName || "",

  driverId: data.driverId || "",
  driverName: data.driverName || "",

  routeId: data.routeId || "",
  routeName: data.routeName || "",

  status: data.status || "LOADED",

  totalLoadedQuantity:
    Number(data.totalLoadedQuantity || 0),

  totalLoadedValue:
    Number(data.totalLoadedValue || 0),

  totalSalesAmount:
    Number(data.totalSalesAmount || 0),

  totalReturnAmount:
    Number(data.totalReturnAmount || 0),

  totalCashCollected:
    Number(data.totalCashCollected || 0),

  totalCreditAmount:
    Number(data.totalCreditAmount || 0),

  totalExpenses:
    Number(data.totalExpenses || 0),

  totalAmountHandedOver:
    Number(data.totalAmountHandedOver || 0),

  settlementDifference:
    Number(data.settlementDifference || 0),
};
}