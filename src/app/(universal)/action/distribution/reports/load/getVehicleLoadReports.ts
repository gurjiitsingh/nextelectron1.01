"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { VehicleLoadReport } from "@/lib/types/distribution/VehicleLoadReportType";
 

type GetVehicleLoadReportsProps = {
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
  status?: string;
  tripId?: string;
  limit?: number;
};

export async function getVehicleLoadReports({
  vehicleId,
  driverId,
  routeId,
  status,
  tripId,
  limit = 100,
}: GetVehicleLoadReportsProps = {}): Promise<{
  success: boolean;
  data: VehicleLoadReport[];
  message?: string;
}> {
  try {
    let query: FirebaseFirestore.Query = adminDb
      .collection("vehicleLoads")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (vehicleId) {
      query = adminDb
        .collection("vehicleLoads")
        .where("vehicleId", "==", vehicleId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (tripId) {
      query = adminDb
        .collection("vehicleLoads")
        .where("tripId", "==", tripId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (driverId) {
      query = adminDb
        .collection("vehicleLoads")
        .where("driverId", "==", driverId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (routeId) {
      query = adminDb
        .collection("vehicleLoads")
        .where("routeId", "==", routeId)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    if (status && status !== "ALL") {
      query = adminDb
        .collection("vehicleLoads")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    const snapshot = await query.get();

    const data: VehicleLoadReport[] = snapshot.docs.map((doc) => {
      const d = doc.data();

      return {
        loadId: doc.id,

        loadNo: d.loadNo,

        tripId: d.tripId,

        vehicleId: d.vehicleId,
        vehicleName: d.vehicleName,

        driverId: d.driverId,
        driverName: d.driverName,

        routeId: d.routeId,
        routeName: d.routeName,

        locationCode: d.locationCode,
        responsiblePerson: d.responsiblePerson,

        totalItems: Number(d.totalItems || 0),

        totalQuantity:
          Number(d.totalQuantity || 0),

        totalValue:
          Number(d.totalValue || 0),

        status: d.status || "LOADED",

        remarks: d.remarks,
        createdBy: d.createdBy,

        createdAt: d.createdAt?.toDate
          ? d.createdAt.toDate()
          : d.createdAt
            ? new Date(d.createdAt)
            : undefined,
      };
    });

    return {
      success: true,
      data,
    };

  } catch (error: any) {

    console.error(
      "❌ getVehicleLoadReports:",
      error
    );

    return {
      success: false,
      data: [],
      message:
        error?.message ||
        "Failed to load vehicle load reports.",
    };
  }
}