"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { getStockLocation } from "./getStockLocationTx";
import { updateStockLocation } from "./updateStockLocation";
import { addStockLocation } from "./addStockLocationTx";
import { addStockMovement } from "./addStockMovement";

import { generateLoadNumber } from "../production/distribution/vehicleLoad/generateLoadNumber";
import { addVehicleLoadItem } from "../production/distribution/vehicleLoad/addVehicleLoadItem";
import { createVehicleLoadMaster } from "../production/distribution/vehicleLoad/createVehicleLoadMaster";

import { getActiveVehicleTrip } from "./getActiveVehicleTrip";


// =====================================================
// TYPES
// =====================================================

type LoadVehicleItem = {
  productId: string;
  quantity: number;
};

type LoadVehicleProps = {
  vehicleId: string;
  vehicleName: string;

  locationCode: string;
  responsiblePerson: string;

  // Optional route information
  routeId?: string;
  routeName?: string;

  // Optional driver information
  driverId?: string;
  driverName?: string;

  remarks?: string;
  createdBy?: string;

  items: LoadVehicleItem[];
};


// =====================================================
// LOAD VEHICLE
// =====================================================

export async function loadVehicle({
  vehicleId,
  vehicleName,

  locationCode,
  responsiblePerson,

  routeId = "",
  routeName = "",

  driverId = "",
  driverName = "",

  remarks,
  createdBy,

  items,
}: LoadVehicleProps) {

  const db = adminDb;

  try {

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required",
      };
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        message: "No products selected",
      };
    }

    // Remove zero / invalid quantities
    const validItems = items.filter(
      (item) =>
        item.productId &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      return {
        success: false,
        message: "No valid products selected",
      };
    }


    // =================================================
    // CREATE UNIQUE LOAD ID
    // =================================================
    //
    // loadId = database identity of THIS loading operation
    //
    // Example:
    //
    // tripId = abc123
    //
    // loadId = xyz789
    //
    // =================================================

    const loadRef = db
      .collection("vehicleLoads")
      .doc();

    const loadId = loadRef.id;

    const loadNo = generateLoadNumber();


    // =================================================
    // TRANSACTION
    // =================================================

    await db.runTransaction(async (tx) => {

      const now = new Date();

      let totalQuantity = 0;
      let totalValue = 0;


      // =================================================
      // 1. READ ACTIVE TRIP
      // =================================================

      const activeTrip =
        await getActiveVehicleTrip(
          tx,
          vehicleId
        );


      // =================================================
      // 2. DETERMINE TRIP
      // =================================================

      let tripId: string;
      let isNewTrip = false;

      if (activeTrip) {

        // Existing journey
        tripId = activeTrip.tripId;

      } else {

        // New journey
        const tripRef = db
          .collection("distributionTrips")
          .doc();

        tripId = tripRef.id;

        isNewTrip = true;
      }


      // =================================================
      // 3. READ FACTORY + VEHICLE STOCK
      // =================================================

      const factoryStocks: Array<{
        item: LoadVehicleItem;
        factory: any;
        van: any;
      }> = [];


      for (const item of validItems) {

        // ---------------------------------------------
        // FACTORY / MAIN STOCK
        // ---------------------------------------------

        const factory =
          await getStockLocation({
            tx,

            productId: item.productId,

            locationType: "STORE",

            locationRef: "MAIN",
          });


        if (!factory) {
          throw new Error(
            `Factory stock not found for product ${item.productId}`
          );
        }


        // ---------------------------------------------
        // VEHICLE STOCK
        // ---------------------------------------------

        const van =
          await getStockLocation({
            tx,

            productId: item.productId,

            locationType: "TRUCK",

            locationRef: vehicleId,
          });


        factoryStocks.push({
          item,
          factory,
          van,
        });
      }


      // =================================================
      // 4. VALIDATE FACTORY STOCK
      // =================================================

      for (const row of factoryStocks) {

        const requestedQty =
          Number(row.item.quantity || 0);

        const availableQty =
          Number(row.factory.quantity || 0);


        if (requestedQty <= 0) {
          throw new Error(
            `${row.factory.productName} has invalid quantity.`
          );
        }


        if (availableQty < requestedQty) {
          throw new Error(
            `${row.factory.productName} has insufficient stock. ` +
            `Available: ${availableQty}, Required: ${requestedQty}`
          );
        }
      }


      // =================================================
      // 5. MOVE STOCK MAIN → VEHICLE
      // =================================================

      for (const row of factoryStocks) {

        const quantity =
          Number(row.item.quantity);


        // ---------------------------------------------
        // REMOVE FROM MAIN STOCK
        // ---------------------------------------------

        await updateStockLocation({
          tx,

          snap: row.factory,

          quantity: -quantity,
        });


        // ---------------------------------------------
        // ADD TO VEHICLE STOCK
        // ---------------------------------------------

        await addStockLocation({
          tx,

          existing: row.van,

          productId:
            row.factory.productId,

          productName:
            row.factory.productName,

          sellingPrice:
            row.factory.sellingPrice,

          wholesalePrice:
            row.factory.wholesalePrice,

          costPrice:
            row.factory.costPrice,

          avgCost:
            row.factory.avgCost,

          locationType: "TRUCK",

          locationRef: vehicleId,

          quantity,
        });


        // =================================================
        // STOCK MOVEMENT
        // =================================================

        await addStockMovement({
          tx,

          // Loading operation
          batchId: loadId,

          // Entire journey
          tripId,

          movementType: "TRANSFER",

          productId:
            row.factory.productId,

          productName:
            row.factory.productName,

          name: vehicleName,

          vehicleId,

          locationCode,

          responsiblePerson,

          wholesalePrice:
            row.factory.wholesalePrice,

          quantity,

          fromLocationType: "STOCK",

          fromLocationRef: "MAIN",

          toLocationType: "TRUCK",

          toLocationRef: vehicleId,

          

          remarks,

          createdBy,
        });


        // =================================================
        // LOAD REPORT VALUES
        // =================================================

        const costPerUnit =
          Number(row.factory.avgCost || 0);

        const lineValue =
          quantity * costPerUnit;


        totalQuantity += quantity;

        totalValue += lineValue;


        // =================================================
        // LOAD ITEM
        // =================================================

        await addVehicleLoadItem(tx, {

          loadId,

          tripId,

          productId:
            row.factory.productId,

          productName:
            row.factory.productName,

          quantity,

          costPerUnit,

          lineValue,

          sellingPrice:
            row.factory.sellingPrice,

          wholesalePrice:
            row.factory.wholesalePrice,
        });
      }


      // =================================================
      // 6. CREATE NEW TRIP
      // =================================================

      if (isNewTrip) {

        const tripRef = db
          .collection("distributionTrips")
          .doc(tripId);


        const tripNo =
          `TRIP-${now
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")}-${Date.now()}`;


        tx.set(tripRef, {

          id: tripId,

          tripNo,

          // -------------------------------------------
          // VEHICLE
          // -------------------------------------------

          vehicleId,

          vehicleName,

          // -------------------------------------------
          // DRIVER
          // -------------------------------------------

          driverId,

          driverName:
            driverName ||
            responsiblePerson,

          responsiblePerson,

          // -------------------------------------------
          // ROUTE
          // -------------------------------------------

          routeId,

          routeName,

          // -------------------------------------------
          // LOCATION
          // -------------------------------------------

          locationCode,

          // -------------------------------------------
          // STATUS
          // -------------------------------------------

          status: "LOADED",

          // -------------------------------------------
          // LOAD TOTALS
          // -------------------------------------------

          totalLoadedQuantity:
            totalQuantity,

          totalLoadedValue:
            totalValue,

          // -------------------------------------------
          // SALES / RETURNS
          // -------------------------------------------

          totalSalesAmount: 0,

          totalReturnAmount: 0,

          totalCashCollected: 0,

          totalCreditAmount: 0,

          // -------------------------------------------
          // SETTLEMENT
          // -------------------------------------------

          totalExpenses: 0,

          totalAmountHandedOver: 0,

          settlementDifference: 0,

          // -------------------------------------------
          // META
          // -------------------------------------------

          remarks:
            remarks || "",

          createdBy:
            createdBy || "ADMIN",

          createdAt: now,

          updatedAt: now,

        });

      } else {

        // =================================================
        // 7. EXISTING TRIP → ADD NEW LOAD TOTALS
        // =================================================

        const tripRef = db
          .collection("distributionTrips")
          .doc(tripId);


        tx.update(tripRef, {

          totalLoadedQuantity:
            (activeTrip?.totalLoadedQuantity || 0) +
            totalQuantity,

          totalLoadedValue:
            (activeTrip?.totalLoadedValue || 0) +
            totalValue,

          updatedAt: now,

          // If a new load happens, vehicle is definitely loaded
          status: "LOADED",
        });
      }


      // =================================================
      // 8. CREATE LOAD MASTER
      // =================================================

      await createVehicleLoadMaster(tx, {

        // -------------------------------------------
        // LOAD
        // -------------------------------------------

        loadId,

        loadNo,

        // -------------------------------------------
        // TRIP
        // -------------------------------------------

        tripId,

        // -------------------------------------------
        // ROUTE
        // -------------------------------------------

        routeId,

        routeName,

        // -------------------------------------------
        // VEHICLE
        // -------------------------------------------

        vehicleId,

        vehicleName,

        // -------------------------------------------
        // DRIVER
        // -------------------------------------------

        driverId,

        driverName:
          driverName ||
          responsiblePerson,

        // -------------------------------------------
        // LOCATION
        // -------------------------------------------

        locationCode,

        responsiblePerson,

        // -------------------------------------------
        // META
        // -------------------------------------------

        remarks,

        createdBy,

        businessDate:
          now
            .toISOString()
            .slice(0, 10),

        // -------------------------------------------
        // TOTALS
        // -------------------------------------------

        totalItems:
          validItems.length,

        totalQuantity,

        totalValue,

        // -------------------------------------------
        // STATUS
        // -------------------------------------------

        status: "LOADED",
      });

    });


    // =================================================
    // SUCCESS
    // =================================================

    return {

      success: true,

      tripId: undefined, // see note below

      loadId,

      loadNo,

      message:
        "Vehicle loaded successfully.",
    };


  } catch (error: any) {

    console.error(
      "❌ loadVehicle:",
      error
    );


    return {

      success: false,

      message:
        error?.message ||
        "Failed to load vehicle.",
    };
  }
}