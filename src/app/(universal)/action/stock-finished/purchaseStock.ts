"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyInventoryMovement } from "../inventory/applyInventoryMovement";
import {  applyFinishedTransactions } from "./finishedStockLedger/applyFinishedTransactions";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type PurchaseStockInput = {
  id: string;

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice: number;

  paymentMethod?: PaymentMethod;

  note?: string;
  createdBy?: string;

  referenceId?: string;
};

export async function purchaseStock({
  id,
  quantity,
  unitPrice,
  transactionUnit,
  paymentMethod,
  note,
  createdBy,
  referenceId,
}: PurchaseStockInput) {
  try {
    // =========================
    // VALIDATION
    // =========================
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    // =========================
    // GET PRODUCT
    // =========================
    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { success: false, message: "Product not found" };
    }

    const productData = productSnap.data();
    const currentStock = productData?.currentStock || 0;

    // =========================
    // PURCHASE = STOCK IN
    // =========================
    const newStock = currentStock + quantity;

    // (optional future: update product stock here if you want direct field update)
    // await productRef.update({ currentStock: newStock });

  

  // =========================
// FINISHED STOCK MOVEMENT
// =========================
const totalAmount = quantity * unitPrice;

await adminDb.runTransaction(async (tx) => {
  // Finished stock ledger
  await applyFinishedTransactions(tx, {
    productId: id,
    type: "PURCHASE",
    direction: "IN",

    quantity,
    transactionUnit,

    unitPrice,
    totalAmount,

    paidAmount: paymentMethod ? totalAmount : 0,
    dueAmount: paymentMethod ? 0 : totalAmount,
    paymentStatus: paymentMethod ? "PAID" : "CREDIT",
    paymentMethod,

    referenceId,
    referenceType: "PURCHASE",

    note: note || "Purchase entry",
    createdBy: createdBy || "admin",
    source: "ADMIN",
  });

  // =========================
  // RAW MATERIAL STOCK
  // =========================

  const recipeSnapshot = await adminDb
    .collection("productRecipes")
    .where("productId", "==", id)
    .get();

  for (const recipeDoc of recipeSnapshot.docs) {
    const recipe = recipeDoc.data();

    const rawQty =
      (Number(recipe.quantity) || 0) * quantity;

    await applyInventoryMovement(tx, {
      inventoryItemId: recipe.inventoryItemId,

      type: "PURCHASE",
      direction: "IN",

      // inventory movement
      quantity: rawQty,
      unitCost: unitPrice,

      // purchase information
      purchaseQuantity: rawQty,
      purchaseUnit: recipe.inventoryUnit,
      purchaseUnitCost: unitPrice,
      conversionFactor: 1,

      supplierId: "",
      supplierName: "",

      totalAmount: rawQty * unitPrice,
      paidAmount: paymentMethod ? rawQty * unitPrice : 0,
      dueAmount: paymentMethod ? 0 : rawQty * unitPrice,
      paymentStatus: paymentMethod ? "PAID" : "CREDIT",
      paymentMethod,

      referenceId: referenceId || "",
      referenceType: "PURCHASE",

      note:
        note ||
        `Purchase stock inflow (${productData?.name})`,

      createdBy: createdBy || "admin",
      source: "ADMIN",
    });
  }
});
   

    // =========================
    // CACHE
    // =========================
    revalidateTag("products","max");
    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message: "Purchase stock added successfully",
    };
  } catch (error) {
    console.error("❌ purchaseStock failed:", error);

    return {
      success: false,
      message: "Failed to process purchase",
    };
  }
}