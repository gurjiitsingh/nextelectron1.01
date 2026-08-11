"use server";


//RED CUSOTMER DATA    readCustomerAccountData

import { adminDb } from "@/lib/firebaseAdmin";
import { getStockLocation } from "../getStockLocationTx";
import { updateStockLocation } from "../updateStockLocation";
import { addStockLocation } from "../addStockLocationTx";
import { addStockMovement } from "../addStockMovement";
 
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { StorageType } from "@/lib/types/distribution/StorageType";

type deliveryTruckSaleItem = {
   productId:string;
  quantity:number;
  wholesalePrice:number;
};

type deliveryTruckSaleProps = {
 vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  remarks?: string;
  createdBy?: string;

  items: deliveryTruckSaleItem[];
};


export async function readStockLocationsForItems({
  tx,
  items,
  fromLocationType,
  fromLocationRef,
  toLocationType,
  toLocationRef,
}: {
  tx: FirebaseFirestore.Transaction;

 items: {
  productId:string;
  quantity:number;
  wholesalePrice:number;
}[]

  fromLocationType: StorageType;
  fromLocationRef: string;

  toLocationType?: StorageType;
  toLocationRef?: string;
}) {
  const stocks = [];

  for (const item of items) {
    const vehicle = await getStockLocation({
      tx,
      productId: item.productId,
      locationType: fromLocationType,
      locationRef: fromLocationRef,
    });

    if (!vehicle) {
      throw new Error(
        `Stock not found for product ${item.productId}.`
      );
    }

    let store = null;

    if (toLocationType && toLocationRef) {
      store = await getStockLocation({
        tx,
        productId: item.productId,
        locationType: toLocationType,
        locationRef: toLocationRef,
      });
    }

    stocks.push({
      item,
      vehicle,
      store,
    });
  }

  return stocks;
}