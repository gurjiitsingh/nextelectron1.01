"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

import { updateCustomerAccount } from "./inventorySupplier/updateCustomerAccount";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyFinishedTransactions } from "./finishedStockLedger/applyFinishedTransactions";
import { applyCustomerTransaction } from "./customer/applyCustomerTransaction";
import { PaymentStatus } from "@/lib/types/PaymentStatus";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD";

type AdjustSaleStock = {
  id: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  type:
    | "SALE"
    | "ADJUSTMENT"
    | "OPENING";

  direction: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  unitPrice: number;

  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;

  paidAmount?: number;
  dueAmount?: number;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?:
    | "MANUAL"
    | "SALE";
};

export async function addItemSale({
  id,
  wholeSaleCutomerId,
  wholeSaleCutomerName,

  type,
  direction,

  quantity,
  unitPrice,
  transactionUnit,

  paymentStatus,
  paymentMethod,

  paidAmount = 0,
  dueAmount = 0,

  note,
  createdBy,

  referenceId,
  referenceType = "MANUAL",
}: AdjustSaleStock) {
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

    const totalAmount =
      quantity * unitPrice;

    // Safety checks

    if (paidAmount < 0) {
      paidAmount = 0;
    }

    if (paidAmount > totalAmount) {
      paidAmount = totalAmount;
    }

    dueAmount =
      Math.max(
        totalAmount - paidAmount,
        0
      );

    if (!paymentStatus) {
      if (paidAmount >= totalAmount) {
        paymentStatus = "PAID";
      } else if (paidAmount > 0) {
        paymentStatus = "PARTIAL";
      } else {
        paymentStatus = "CREDIT";
      }
    }

    await adminDb.runTransaction(
      async (tx) => {

          // ============================
  // READ CUSTOMER ACCOUNT FIRST
  // ============================

 let currentBalance = 0;
let currentCreditBalance = 0;

  if (type === "SALE" && wholeSaleCutomerId) {
    const accountRef = adminDb
    .collection("customerAccounts")
    .doc(wholeSaleCutomerId);

  const accountSnap = await tx.get(accountRef);

  const data = accountSnap.data() || {};

  currentBalance = Number(data.balance || 0);
  currentCreditBalance = Number(data.creditBalance || 0);
  }

        // ==========================================
        // FINISHED PRODUCT LEDGER
        // ==========================================
console.log("this is before---------------------")
        await applyFinishedTransactions(
          tx,
          {
            productId: id,

            type: "SALE",
            direction: "OUT",

            quantity,
            transactionUnit,

            unitPrice,
            totalAmount,

            paidAmount,
            dueAmount,

            paymentStatus,
            paymentMethod,

            referenceId,
            referenceType,

            note,
            createdBy:
              createdBy || "admin",

            source: createdBy || "ADMIN",
          }
        );
console.log("this is after---------------------")
        // ==========================================
        // CUSTOMER ACCOUNT
        // ==========================================

        if (
          type === "SALE" &&
          wholeSaleCutomerId
        ) {
          await updateCustomerAccount(tx, {
            wholeSaleCutomerId,
wholeSaleCutomerName,
            type: "SALE",

            totalAmount,
            paidAmount,
            dueAmount,
            currentCreditBalance,
          currentBalance,
            paymentMethod,
          });

          await applyCustomerTransaction(
            tx,
            {
              customerId:
                wholeSaleCutomerId,

              customerName:
                wholeSaleCutomerName,

              type: "SALE",

              totalAmount,
              returnProductAmount:0,
              paidAmount,
              dueAmount,
              currentBalance,
              creditAmount: 0,
              currentCreditBalance,
              paymentMethod,

              referenceId,
              referenceType,

              note,

              createdBy:
                createdBy || "admin",

              source:   "ADMIN",
            }
          );
        }
      }
    );

    revalidateTag("products", "max");
    revalidatePath(
      "/admin/stock-finished"
    );

    return {
      success: true,
      message:
        "Stock updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ addItemSale failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update stock",
    };
  }
}