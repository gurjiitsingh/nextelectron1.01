"use server";

import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { ProductStockType } from "@/lib/types/productStockType";

import { applyFinishedTransactions } from "./sale/applyFinishedTransactions";

type RecordTruckSaleLedgerInput = {
  tx: FirebaseFirestore.Transaction;

  finishedProduct: ProductStockType;

  id: string;

  type:
    | "SALE"
    | "ADJUSTMENT"
    | "OPENING";

  direction: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  unitPrice: number;

  referenceId?: string;
  referenceType?: "MANUAL" | "SALE";

  note?: string;
  createdBy?: string;
};

export async function recordTruckSaleLedger({
  tx,
  finishedProduct,
  id,

  type,
  direction,

  quantity,
  unitPrice,
  transactionUnit,

  referenceId,
  referenceType = "MANUAL",

  note,
  createdBy,
}: RecordTruckSaleLedgerInput) {
  try {

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!id) {
      return {
        success: false,
        message: "Product ID required",
      };
    }

    if (!quantity || quantity <= 0) {
      return {
        success: false,
        message: "Invalid quantity",
      };
    }

    if (unitPrice < 0) {
      return {
        success: false,
        message: "Invalid unit price",
      };
    }


    // ==========================================
    // ITEM VALUE
    // ==========================================

    const totalAmount =
      quantity * unitPrice;


    // ==========================================
    // FINISHED PRODUCT LEDGER
    //
    // This is ITEM level.
    //
    // Payment does NOT belong here.
    // Customer accounting does NOT belong here.
    // ==========================================

    await applyFinishedTransactions(tx, {
      productId: id,

      finishedProduct,

      type: "SALE",

      direction: "OUT",

      quantity,

      transactionUnit,

      unitPrice,

      totalAmount,

      // Sale payment is handled by SALE MASTER
      paidAmount: 0,

      dueAmount: totalAmount,

      paymentStatus: "CREDIT" as PaymentStatus,

      paymentMethod: undefined,

      referenceId,

      referenceType,

      note,

      createdBy:
        createdBy || "admin",

      source:
        createdBy || "ADMIN",
    });


    return {
      success: true,

      message:
        "Truck sale item ledger recorded successfully.",

      totalAmount,
    };

  } catch (error) {

    console.error(
      "❌ recordTruckSaleLedger failed:",
      error
    );

    throw error;
  }
}