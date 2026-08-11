"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

import { updateSupplierAccount } from "../inventorySupplier/updateSupplierAccount";

import { PaymentStatus } from "@/lib/types/PaymentStatus";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  supplierId?: string;
 supplierName?: string;
  type: InventoryTransactionNameType;

  direction:
    | "IN"
    | "OUT";

  // =====================================
  // INTERNAL STOCK VALUES (consumption)
  // =====================================

  quantity: number;

  unitCost: number;

  // =====================================
  // ORIGINAL USER INPUT VALUES
  // =====================================

  purchaseQuantity?: number;

  purchaseUnit?: string;

  purchaseUnitCost?: number;

  conversionFactor?: number;

  paymentStatus: PaymentStatus;

  paymentMethod?: PaymentMethod;

  paidAmount?: number;

  note?: string;

  createdBy?: string;

  referenceId?: string;

  referenceType?:
    | "PURCHASE"
    | "MANUAL";
};

export async function newInventoryItemAndTransaction({
  inventoryItemId,
  supplierId,
    supplierName,
  type,
  direction,

  quantity,
  unitCost,

  // ✅ ORIGINAL PURCHASE VALUES
  purchaseQuantity,
  purchaseUnit,
  purchaseUnitCost,
  conversionFactor,

  paymentStatus,
  paymentMethod,
  paidAmount: paidAmountInput,

  note,
  createdBy,
  referenceId,
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {

  try {

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!inventoryItemId) {
      return {
        success: false,
        message:
          "Inventory item required",
      };
    }

    if (!quantity || quantity <= 0) {
      return {
        success: false,
        message:
          "Quantity must be greater than 0",
      };
    }

    // =====================================================
    // GET INVENTORY
    // =====================================================

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    const inventorySnap =
      await inventoryRef.get();

    if (!inventorySnap.exists) {
      return {
        success: false,
        message:
          "Inventory item not found",
      };
    }

    const inventoryData =
      inventorySnap.data();

    const previousStock =
      Number(
        inventoryData?.currentStock
      ) || 0;

    // =====================================================
    // GET SUPPLIER
    // =====================================================

   



    // =====================================================
    // STOCK CALCULATION
    // =====================================================

    let afterStock =
      previousStock;

    if (direction === "IN") {

      afterStock =
        previousStock + quantity;

    } else {

      afterStock =
        previousStock - quantity;

      if (afterStock < 0) {
        return {
          success: false,
          message:
            "Insufficient stock",
        };
      }
    }

    // =====================================================
    // COST CALCULATION
    // =====================================================

    const finalUnitCost =
      unitCost !== undefined
        ? unitCost
        : Number(
            inventoryData?.costPrice
          ) || 0;

    const shouldApplyCost =
      type === "PURCHASE" ||
      type === "OPENING_STOCK" ||
      type ===
        "CUSTOMER_RETURN";

        const totalAmount = shouldApplyCost
  ? quantity * finalUnitCost
  : 0;

    

    // =====================================================
    // PAYMENT CALCULATION
    // =====================================================

    const isPurchase =
      type ===
        "PURCHASE" &&
      direction === "IN";

    const paymentStatusSafe =
      paymentStatus || "PAID";

    const paidAmountRaw =
      isPurchase &&
      paymentStatusSafe === "PAID"
        ? totalAmount
        : Number(
            paidAmountInput || 0
          );

    if (
      paidAmountRaw > totalAmount
    ) {
      return {
        success: false,
        message:
          "Paid amount cannot exceed total amount",
      };
    }

    const paidAmount =
      paidAmountRaw;

    const dueAmount =
      isPurchase
        ? Math.max(
            0,
            totalAmount -
              paidAmount
          )
        : 0;

    // =====================================================
    // PURCHASE VALIDATION
    // =====================================================

    if (
      type ===
        "PURCHASE" &&
      !supplierId
    ) {
      return {
        success: false,
        message:
          "Supplier required for purchase",
      };
    }

    // =====================================================
    // AVERAGE COST CALCULATION
    // =====================================================

    const oldCostPrice =
      Number(
        inventoryData?.costPrice
      ) || 0;

    let updatedCostPrice =
      oldCostPrice;

    if (
      direction === "IN" &&
      (
        type ===
          "PURCHASE" ||
        type ===
          "OPENING_STOCK" ||
        type ===
          "CUSTOMER_RETURN"
      )
    ) {

      const oldStockValue =
        previousStock *
        oldCostPrice;

      const newStockValue =
        quantity *
        finalUnitCost;

      const totalStock =
        previousStock +
        quantity;

      if (totalStock > 0) {

        updatedCostPrice =
          (
            oldStockValue +
            newStockValue
          ) / totalStock;
      }
    }

    // =====================================================
    // UPDATE INVENTORY
    // =====================================================

    await inventoryRef.update({
      currentStock:
        afterStock,

      costPrice:
        updatedCostPrice,

      updatedAt:
        admin.firestore
          .FieldValue
          .serverTimestamp(),
    });

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================

    await adminDb
      .collection(
        "inventoryTransactions"
      )
      .add({

        // =====================================
        // ITEM
        // =====================================

        inventoryItemId,

        inventoryItemName:
          inventoryData?.name ||
          "",

        // =====================================
        // SUPPLIER
        // =====================================

        supplierId:
          supplierId || "",

        supplierName:
          supplierName || "",

        // =====================================
        // TRANSACTION
        // =====================================

        type,

        direction,

        // =====================================
        // ORIGINAL PURCHASE VALUES
        // =====================================

        purchaseQuantity:
        purchaseQuantity ?? quantity,

        purchaseUnit:
          purchaseUnit ||
          inventoryData?.purchaseUnit ||
          inventoryData?.consumptionUnit,

        // purchaseUnitCost:
        //   purchaseUnitCost ||
        //   unitCost,

        // conversionFactor:
        //   conversionFactor ||
        //   inventoryData?.conversionFactor ||
        //   1,

        purchaseUnitCost:
  purchaseUnitCost ?? unitCost,

conversionFactor:
  conversionFactor ??
  inventoryData?.conversionFactor ??
  1,

        // =====================================
        // INTERNAL STOCK VALUES
        // =====================================

        quantity,

        unit:
          inventoryData?.consumptionUnit ||
          "pcs",

        unitCost:
          finalUnitCost,

        // =====================================
        // STOCK SNAPSHOT
        // =====================================

        beforeStock:
          previousStock,

        afterStock,

        // =====================================
        // PAYMENT
        // =====================================

        totalAmount,

        paidAmount,

        dueAmount,

        paymentStatus:
          paymentStatusSafe,

        paymentMethod:
          paymentMethod ||
          null,

        // =====================================
        // REFERENCES
        // =====================================

        referenceType,

        referenceId:
          referenceId || "",

        // =====================================
        // META
        // =====================================

        note:
          note ||
          "Manual inventory adjustment",

        createdBy:
          createdBy || "admin",

        createdAt:
          admin.firestore
            .FieldValue
            .serverTimestamp(),
      });

    // =====================================================
    // SUPPLIER LEDGER
    // =====================================================

    const isSupplierFlow =
      supplierId &&
      (
        type ===
          "PURCHASE" ||
        type ===
          "SUPPLIER_RETURN"
      );

    if (isSupplierFlow) {

      let ledgerType:
        | "PURCHASE"
        | "RETURN" =
        "PURCHASE";

      if (
        type ===
        "SUPPLIER_RETURN"
      ) {
        ledgerType =
          "RETURN";
      }

    
    }

    // =====================================================
    // UPDATE SUPPLIER ACCOUNT
    // =====================================================

  

    // =====================================================
    // REVALIDATE
    // =====================================================

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/dashboard"
    );

    return {
      success: true,
      message:
        "Inventory updated successfully",
    };

  } catch (error) {

    console.error(
      "❌ adjustInventoryStock failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update inventory",
    };
  }
}