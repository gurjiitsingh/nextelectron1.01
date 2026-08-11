"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type TruckSaleReport = {
  saleId: string;
  tripId: string;

  vehicleId: string;
  vehicleName: string;

  customerId: string;
  customerName: string;

  totalItems: number;
  totalQuantity: number;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  paymentStatus:
    | "PAID"
    | "PARTIAL"
    | "CREDIT";

  paymentMethod?: string;

  status: string;

  remarks?: string;
  createdBy?: string;

  createdAt?: Date;
};


type GetTruckSaleReportsProps = {
  vehicleId?: string;
  tripId?: string;
  customerId?: string;
  paymentStatus?: string;
  limit?: number;
};


export async function getTruckSaleReports({
  vehicleId,
  tripId,
  customerId,
  paymentStatus,
  limit = 100,
}: GetTruckSaleReportsProps = {}): Promise<{
  success: boolean;
  data: TruckSaleReport[];
  message?: string;
}> {

  try {

    let query: FirebaseFirestore.Query =
      adminDb
        .collection("truckSales")
        .orderBy("createdAt", "desc")
        .limit(limit);


    // =========================================
    // VEHICLE
    // =========================================

    if (vehicleId) {

      query = adminDb
        .collection("truckSales")
        .where(
          "vehicleId",
          "==",
          vehicleId
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(limit);
    }


    // =========================================
    // TRIP
    // =========================================

    if (tripId) {

      query = adminDb
        .collection("truckSales")
        .where(
          "tripId",
          "==",
          tripId
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(limit);
    }


    // =========================================
    // CUSTOMER
    // =========================================

    if (customerId) {

      query = adminDb
        .collection("truckSales")
        .where(
          "wholeSaleCutomerId",
          "==",
          customerId
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(limit);
    }


    // =========================================
    // PAYMENT STATUS
    // =========================================

    if (
      paymentStatus &&
      paymentStatus !== "ALL"
    ) {

      query = adminDb
        .collection("truckSales")
        .where(
          "paymentStatus",
          "==",
          paymentStatus
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(limit);
    }


    // =========================================
    // GET DATA
    // =========================================

    const snapshot =
      await query.get();


    const data:
      TruckSaleReport[] =
      snapshot.docs.map(
        (doc) => {

          const d =
            doc.data();


          return {

            saleId:
              doc.id,

            tripId:
              d.tripId || "",


            vehicleId:
              d.vehicleId || "",

            vehicleName:
              d.vehicleName || "",


            customerId:
              d.wholeSaleCutomerId ||
              "",

            customerName:
              d.wholeSaleCutomerName ||
              "",


            totalItems:
              Number(
                d.totalItems || 0
              ),

            totalQuantity:
              Number(
                d.totalQuantity || 0
              ),


            totalAmount:
              Number(
                d.totalAmount || 0
              ),

            paidAmount:
              Number(
                d.paidAmount || 0
              ),

            dueAmount:
              Number(
                d.dueAmount || 0
              ),


            paymentStatus:
              d.paymentStatus ||
              "CREDIT",

            paymentMethod:
              d.paymentMethod ||
              undefined,


            status:
              d.status ||
              "COMPLETED",


            remarks:
              d.remarks,

            createdBy:
              d.createdBy,


            createdAt:
              d.createdAt?.toDate
                ? d.createdAt.toDate()
                : d.createdAt
                  ? new Date(
                      d.createdAt
                    )
                  : undefined,
          };
        }
      );


    return {
      success: true,
      data,
    };


  } catch (error: any) {

    console.error(
      "❌ getTruckSaleReports:",
      error
    );


    return {
      success: false,

      data: [],

      message:
        error?.message ||
        "Failed to load truck sale reports.",
    };
  }
}