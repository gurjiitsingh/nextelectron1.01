"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { inventoryAdjust } from "./inventoryAdjust";
import { inventoryPurchase } from "./inventoryPurchase";
import { applySupplierTransaction } from "../inventorySupplier/applySupplierTransaction";
import { updateSupplierAccount } from "../inventorySupplier/updateSupplierAccount";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  type: InventoryTransactionNameType;
  supplierId?: string;
  supplierName: string;
  direction: "IN" | "OUT";

  // INTERNAL (consumption unit)
  quantity: number;
  unitCost: number;
  stockValue?: number;
  paymentMethod?: PaymentMethodType;
  paidAmount?: number;
  // USER INPUT (purchase unit)
  purchaseQuantity?: number;
  purchaseUnit?: string;
  purchaseUnitCost?: number;
  conversionFactor?: number;

  paymentStatus: PaymentStatus;

  note?: string;
  createdBy?: string;

  referenceId?: string;

  referenceType?: "MANUAL";
};

export async function purchaseStock({
  inventoryItemId,

  type,
  direction,
  supplierId,
  supplierName,
  quantity,
  unitCost,
  stockValue,
  paidAmount,
  paymentMethod,
  purchaseQuantity,
  purchaseUnit,
  purchaseUnitCost,
  conversionFactor,

  paymentStatus,

  note,
  createdBy,

   
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {


  const referenceId = "kjkljk"
  console.log("========== Purchase Inventory Stock ==========");

  console.log("inventoryItemId:", inventoryItemId);
  console.log("type:", type);

  console.log("supplierName:", supplierName);
  console.log("supplierId:", supplierId);

  console.log("quantity:", quantity);
  console.log("purchaseQuantity:", purchaseQuantity);
  console.log("purchaseUnit:", purchaseUnit);
  console.log("purchaseUnitCost:", purchaseUnitCost);
  console.log("conversionFactor:", conversionFactor);
  console.log("purchaseStockValue:", stockValue);

  console.log("paymentStatus:", paymentStatus);
  console.log("note:", note);
  console.log("createdBy:", createdBy);
  console.log("referenceId:", referenceId);
  console.log("referenceType:", referenceType);
  

   console.log("unitCost:", unitCost);
  console.log("==========================================");

  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!inventoryItemId) {
      return {
        success: false,
        message: "Inventory item required",
      };
    }

    if (quantity <= 0) {
      return {
        success: false,
        message: "Quantity must be greater than 0",
      };
    }

    // Cost required only when user is adding/replacing stock
    if ((purchaseUnitCost ?? 0) <= 0) {
      return {
        success: false,
        message: "Unit cost must be greater than 0",
      };
    }

    await adminDb.runTransaction(async (tx) => {


      const inventoryRef = adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId);

      const inventorySnap =
        await tx.get(inventoryRef);

      if (!inventorySnap.exists) {
        throw new Error(
          "Inventory item not found"
        );
      }



      let currentBalance = 0;
      let currentCreditBalance = 0;

      if (supplierId) {
        const supplierAccountRef = adminDb
          .collection("supplierAccounts")
          .doc(supplierId);

        const supplierAccountSnap =
          await tx.get(supplierAccountRef);

        if (supplierAccountSnap.exists) {
          const supplierData =
            supplierAccountSnap.data()!;

          currentBalance = Number(
            supplierData.balance ?? 0
          );

          currentCreditBalance = Number(
            supplierData.creditBalance ?? 0
          );
        }
      }

      // =====================================================
      // UPDATE INVENTORY
      // =====================================================

      const averageCost = Number(purchaseUnitCost);

    //  const  totalAmountPurchased = Number(purchaseUnitCost);,
    //  const   StockValuePuchased,

      const totalAmount =
        Number(stockValue) ||
        quantity * averageCost;

      await inventoryPurchase(tx, {
        inventoryItemId,

        type: "PURCHASE",
        direction: "IN",
        supplierId,
        supplierName,
        
        quantity,
      
      

        purchaseQuantity: purchaseQuantity!,
        purchaseUnit: purchaseUnit! ,
        purchaseUnitCost: purchaseUnitCost!,
        conversionFactor: conversionFactor!,

        referenceType,
        referenceId,

        note,
        createdBy,

        source: "WEB_ADMIN",
      });






      const total = Number(totalAmount);
      const paid = Number(paidAmount);
      const due = Math.max(total - paid, 0);


      await updateSupplierAccount(tx, {
        supplierId: supplierId!,
        supplierName,

        type: "PURCHASE",

        totalAmount: total,
        paidAmount: paid,
        dueAmount: due,

        currentBalance,
        currentCreditBalance,

        paymentMethod,
      });

      await applySupplierTransaction(tx, {
        supplierId,
        supplierName,

        type: "PURCHASE",

        totalAmount: total,
        paidAmount: paid,
        dueAmount: due,

        currentBalance,
        currentCreditBalance,
        quantity,
        conversionFactor,
        purchaseUnit,
        paymentMethod,

        referenceType,
        referenceId,

        note,
        createdBy,
        source: "WEB_ADMIN",
      });












    });

    // revalidateTag("inventory-items", "max");
    // revalidatePath("/admin/inventory");
    // revalidatePath("/admin/inventory/dashboard");

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