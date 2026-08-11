"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getStockLocation } from "./getStockLocationTx";
import { updateStockLocation } from "./updateStockLocation";
import { addStockLocation } from "./addStockLocationTx";
import { addStockMovement } from "./addStockMovement";

type UnloadVehicleItem = {
  productId: string;
  quantity: number;
};

type UnloadVehicleProps = {
  vehicleId: string;
  vehicleName: string,
  locationCode: string,
  responsiblePerson: string,
  remarks?: string;
  createdBy?: string;

  items: UnloadVehicleItem[];
};

export async function unloadVehicle({
  vehicleId,
  vehicleName,
  locationCode,
  responsiblePerson,
  remarks,
  createdBy,
  items,
}: UnloadVehicleProps) {

  console.log("data-------------", vehicleId,
    vehicleName,
    locationCode,
    responsiblePerson,
    remarks,
    createdBy,
    items,)

  const db = adminDb;

  try {
    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required.",
      };
    }

    if (!items.length) {
      return {
        success: false,
        message: "No products selected.",
      };
    }

    await db.runTransaction(async (tx) => {
      const stocks = [];

      // =========================
      // READ
      // =========================

      for (const item of items) {
        const van = await getStockLocation({
          tx,
          productId: item.productId,
          locationType: "TRUCK",
          locationRef: vehicleId,
        });

        if (!van) {
          throw new Error("Vehicle stock not found.");
        }

        const factory = await getStockLocation({
          tx,
          productId: item.productId,
          locationType: "STORE",
          locationRef: "MAIN",
        });

        stocks.push({
          item,
          van,
          factory,
        });
      }

      // =========================
      // VALIDATE
      // =========================

      for (const row of stocks) {
        if (row.van.quantity < row.item.quantity) {
          throw new Error(
            `${row.van.productName} has insufficient vehicle stock.`
          );
        }
      }

      // =========================
      // WRITE
      // =========================

      for (const row of stocks) {
        // Remove from vehicle
        await updateStockLocation({
          tx,
          snap: row.van,
          quantity: -row.item.quantity,
        });

        // Add back to factory
        //   await addStockLocation({
        //    tx,
        //     existing: row.van,
        //     productId: row.factory!.productId,
        //     productName: row.factory!.productName,
        //       sellingPrice: row.factory!.sellingPrice, 
        // wholesalePrice: row.factory!.wholesalePrice,
        // costPrice: row.factory!.costPrice,
        // avgCost: row.factory!.avgCost,
        //     // productMode: row.factory.productMode as
        //     //   | "raw_stock"
        //     //   | "finished_stock"
        //     //   | "simple",
        //     locationType: "TRUCK",
        //     locationRef: vehicleId,
        //     quantity: row.item.quantity,
        //   });


        await addStockLocation({
          tx,
          existing: row.factory,      // use factory/store location
          productId: row.factory!.productId,
          productName: row.factory!.productName,
          sellingPrice: row.factory!.sellingPrice,
          wholesalePrice: row.factory!.wholesalePrice,
          costPrice: row.factory!.costPrice,
          avgCost: row.factory!.avgCost,

          locationType: "STORE",
          locationRef: "MAIN",

          quantity: row.item.quantity,
        });
        // Movement history
        await addStockMovement({
          tx,
          batchId: "ABC",
          movementType: "TRANSFER",

          productId: row.van.productId,
          productName: row.van.productName,
          //productMode: row.van.productMode,
          name: vehicleName,
          locationCode,
          responsiblePerson: responsiblePerson,
          quantity: row.item.quantity,

          fromLocationType: "TRUCK",
          fromLocationRef: vehicleId,

          toLocationType: "STORE",
          toLocationRef: "MAIN",

          remarks,
          createdBy,
        });
      }
    });

    return {
      success: true,
      message: "Vehicle unloaded successfully.",
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message || "Failed to unload vehicle.",
    };
  }
}