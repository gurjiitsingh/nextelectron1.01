"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { updateCustomerAccount } from "./inventorySupplier/updateCustomerAccount";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import { applyFinishedTransactions } from "./finishedStockLedger/applyFinishedTransactions";
import { applyCustomerTransaction } from "./customer/applyCustomerTransaction";



type PaymentMethod = "CASH" | "UPI" | "CARD";

type CustomerReturnStock = {
  id: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  type: "RETURN";
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice: number;

  paymentMethod?: PaymentMethod;

  note?: string;
  createdBy?: string;

  referenceId?: string;
  referenceType?: "MANUAL" | "SALE";
};

export async function customerReturn({
  id,
  wholeSaleCutomerId,
  wholeSaleCutomerName,
  type = "RETURN",
  direction = "IN",
  quantity,
  unitPrice,
  transactionUnit,
  paymentMethod,
  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: CustomerReturnStock) {


  try {
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    // =========================
    // GET PRODUCT
    // =========================
    const productRef = adminDb.collection("productStock").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();
    const currentStock = productData?.currentStock || 0;

    // =========================
    // STOCK UPDATE (RETURN = INCREASE)
    // =========================
    const newStock = currentStock + quantity;

    // =========================
    // FINISHED STOCK MOVEMENT
    // =========================
    const totalAmount = 0;
    const creditAmount = quantity * unitPrice;
    let currentCreditBalance = 0;
const returnProductAmount = quantity * unitPrice;


    await adminDb.runTransaction(async (tx) => {

      let currentBalance = 0;

      if (wholeSaleCutomerId) {
        const accountRef = adminDb
          .collection("customerAccounts")
          .doc(wholeSaleCutomerId);

        const accountSnap = await tx.get(accountRef);

        currentBalance = Number(accountSnap.data()?.balance || 0 );
        currentCreditBalance = Number(accountSnap.data()?.creditBalance || 0);
      }

      const movement = await applyFinishedTransactions(tx, {
        productId: id,
        type: "RETURN",
        direction: "IN",

        quantity,
        transactionUnit,

        unitPrice,
        totalAmount: creditAmount,
returnProductAmount,
        paidAmount: paymentMethod ? totalAmount : 0,
        dueAmount: paymentMethod ? 0 : totalAmount,

        paymentStatus: paymentMethod ? "PAID" : "CREDIT",
        paymentMethod,

        referenceId,
        referenceType,

        note,
        createdBy: createdBy || "admin",
        source: "ADMIN",
      });

      // =========================
      // CUSTOMER ACCOUNT REVERSAL
      // =========================
      if (wholeSaleCutomerId) {
        await updateCustomerAccount(tx, {
          wholeSaleCutomerId,
          wholeSaleCutomerName,
          type: "CUSTOMER_RETURN",

          totalAmount: 0, // not used for return
          paidAmount: 0,
          dueAmount: 0,
          creditAmount,
          currentCreditBalance,
          currentBalance, // ✅ FIXED

          paymentMethod,
        });



        await applyCustomerTransaction(tx, {
          customerId: wholeSaleCutomerId,
          customerName: wholeSaleCutomerName,

          type: "CUSTOMER_RETURN",

          totalAmount,// in this case it is total amount of return
          returnProductAmount,
          paidAmount: 0,
          dueAmount: 0,
          creditAmount: creditAmount ? creditAmount : 0,
          currentCreditBalance,
          currentBalance,

          paymentMethod,

          referenceId,
          referenceType,

          note,
          createdBy: createdBy || "admin",
          source: "ADMIN",
        });




      }
    });

    // =========================
    // CACHE REFRESH
    // =========================
    revalidateTag("products", "max");
    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Customer return processed successfully",
    };
  } catch (error) {
    console.error("❌ customerReturn failed:", error);

    return {
      success: false,
      message: "Failed to process customer return",
    };
  }
}