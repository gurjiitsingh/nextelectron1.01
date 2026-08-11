"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryLedgerType } from "@/lib/types/inventory/InventoryLedgerType";
import { Timestamp } from "firebase-admin/firestore";

type Props = {
  type?: string;
  date?: string;
};

export async function getInventoryTransactionsSelected({
  type = "PURCHASE",
  date,
}: Props = {}) {
  try {
    // Default to today
    const selectedDate = date
      ? new Date(`${date}T00:00:00`)
      : new Date();

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    let query = adminDb
      .collection("stockLedgerInventory")
      .where(
        "createdAt",
        ">=",
        Timestamp.fromDate(startOfDay)
      )
      .where(
        "createdAt",
        "<=",
        Timestamp.fromDate(endOfDay)
      );

    if (type !== "ALL") {
      query = query.where("type", "==", type);
    }

    const snapshot = await query
      .orderBy("createdAt", "desc")
      .get();

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data() as InventoryLedgerType;

      return {
        id: doc.id,

        // ITEM
        inventoryItemName: data.inventoryItemName,

        // TRANSACTION
        type: data.type,
        direction: data.direction,

        // PARTY
        partyName: data.partyName,
        partyType: data.partyType,

        // MOVEMENT
        quantity: data.quantity,
        unit: data.transactionUnit,
        unitCost: data.transactionUnitCost,
transactionUnitCost: data.transactionUnitCost,
transactionAmount: data.transactionAmount,

        // PURCHASE
        purchaseQuantity: data.purchaseQuantity,
        purchaseUnit: data.purchaseUnit,
        purchaseUnitCost: data.purchaseUnitCost,
        conversionFactor: data.conversionFactor,
consumptionUnit: data.consumptionUnit ? data.consumptionUnit  : data.transactionUnit,
        // STOCK
        beforeStock: data.beforeStock,
        afterStock: data.afterStock,

        // VALUE
        totalAmount: data.totalAmount,

        // AUDIT
        createdBy:
          data.createdByName ??
          data.createdById,

        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt.getTime()
            : "seconds" in data.createdAt
            ? data.createdAt.seconds * 1000
            : "_seconds" in (data.createdAt as any)
            ? (data.createdAt as any)._seconds * 1000
            : null,
      };
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: [],
    };
  }
}