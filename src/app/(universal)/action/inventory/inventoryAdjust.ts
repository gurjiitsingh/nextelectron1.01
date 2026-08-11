"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { ApplyInventoryTransactionType } from "@/lib/types/ApplyInventoryTransactionType";
import { InventoryLedgerType } from "@/lib/types/inventory/InventoryLedgerType";



const COST_TYPES = new Set([
    "PURCHASE",
    "OPENING_STOCK",
    "CUSTOMER_RETURN",
    "CLEAR",
]);

export async function inventoryAdjust(
    tx: FirebaseFirestore.Transaction,
    {
        inventoryItemId,

        type,
        direction,

        quantity,
        stockValue,
        unitCost,
 
        purchaseQuantity,
        purchaseUnit,
        purchaseUnitCost,
        conversionFactor,

        supplierId,
        supplierName,

        totalAmount = 0,
        paidAmount = 0,
        dueAmount = 0,
        paymentStatus = "PAID",
        paymentMethod = null,

        referenceType = "MANUAL",
        referenceId = "",

        note = "",
        createdBy = "system",

        source = "SYSTEM",
    }: ApplyInventoryTransactionType) {


          console.log("========== adjustInventoryStock ==========");

  console.log("inventoryItemId:", inventoryItemId);
  console.log("type:", type);
  console.log("direction:", direction);

  console.log("quantity:", quantity);
  console.log("unitCost:", unitCost);

  console.log("purchaseQuantity:", purchaseQuantity);
  console.log("purchaseUnit:", purchaseUnit);
  console.log("purchaseUnitCost:", purchaseUnitCost);
  console.log("conversionFactor:", conversionFactor);

  console.log("paymentStatus:", paymentStatus);

  console.log("note:", note);
  console.log("createdBy:", createdBy);

  console.log("referenceId:", referenceId);
  console.log("referenceType:", referenceType);

  console.log("stockValue:", stockValue);

  console.log("==========================================");


    const now = admin.firestore.FieldValue.serverTimestamp();

    if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
    }

    const inventoryRef =
        adminDb.collection("inventoryItems").doc(inventoryItemId);


    const snap = await tx.get(inventoryRef);

    if (!snap.exists) {
        throw new Error("Inventory item not found");
    }

    const inventory = snap.data()!;

    // =====================================================
    // UPDATE INVENTORY ITEM (MASTER STOCK)
    // =====================================================

  // =====================================================
// CURRENT INVENTORY VALUES
// =====================================================

const beforeStock =
  Number(inventory.currentStock ?? 0);

const beforeAverageCost =
  Number(inventory.averageCost ?? 0);

const beforeStockValue =
  Number(inventory.stockValue ?? 0);

const beforePurchaseUnitCost =
  Number(inventory.purchaseUnitCost ?? 0);

 

const purchaseUnitCostN =
  Number(purchaseUnitCost ?? 0);

// =====================================================
// LEDGER VALUES
// =====================================================

const isCostMovement =
  COST_TYPES.has(type);

// Cost per consumption unit for ledger
const finalUnitCost =
  Number(unitCost ?? beforeAverageCost);

// =====================================================
// VALUES AFTER TRANSACTION
// =====================================================

let afterStock =
  beforeStock;

let afterStockValue =
  beforeStockValue;

let afterAverageCost =
  beforeAverageCost;

let afterPurchaseUnitCost =
  beforePurchaseUnitCost;

switch (type) {
  // =====================================================
  // OPENING STOCK
  // Replace entire inventory
  // =====================================================
  case "OPENING_STOCK": {
    afterStock = quantity;

    afterStockValue = totalAmount;

    afterAverageCost =
      afterStock > 0
        ? afterStockValue / afterStock
        : 0;

    break;
  }

  // =====================================================
  // MANUAL ADJUSTMENT
  // =====================================================
  case "ADJUSTMENT": {
    if (direction === "IN") {
      // Add stock
      afterStock =
        beforeStock + quantity;

      afterStockValue =
        beforeStockValue + totalAmount;

      // Recalculate weighted average
      afterAverageCost =
        afterStock > 0
          ? afterStockValue / afterStock
          : 0;
    } else {
      // Remove stock

      if (quantity > beforeStock) {
        throw new Error(
          "Insufficient stock"
        );
      }

      afterStock =
        beforeStock - quantity;

      afterStockValue =
        beforeStockValue -
        quantity * beforeAverageCost;

      // Average cost DOES NOT change
      afterAverageCost =
        beforeAverageCost;
    }

    break;
  }

  // =====================================================
  // WASTAGE
  // =====================================================
  case "WASTAGE": {
    if (quantity > beforeStock) {
      throw new Error(
        "Insufficient stock"
      );
    }

    afterStock =
      beforeStock - quantity;

    afterStockValue =
      beforeStockValue -
      quantity * beforeAverageCost;

    // Average cost stays same
    afterAverageCost =
      beforeAverageCost;

    break;
  }
}

   // =====================================================
// FINAL SAFETY
// =====================================================

afterStockValue = Number(
  Math.max(0, afterStockValue).toFixed(2)
);

afterAverageCost = Number(
  afterAverageCost.toFixed(8)
);

// =====================================================
// PURCHASE UNIT COST
// =====================================================

let newPurchaseUnitCost =
  Number(inventory.purchaseUnitCost ?? 0);

let newPurchaseUnitCostStockValue =
  Number(inventory.stockValue ?? 0);

const factor =
  Number(conversionFactor || 1);

const stockQtyInPurchaseUnit =
  beforeStock / factor;

const transactionQtyInPurchaseUnit =
  quantity / factor;

switch (type) {
  // -----------------------------------
  // Opening Stock
  // -----------------------------------
  case "OPENING_STOCK":
    newPurchaseUnitCost =
      purchaseUnitCostN;

    newPurchaseUnitCostStockValue =
      Number(
        (
          purchaseUnitCostN *
          transactionQtyInPurchaseUnit
        ).toFixed(2)
      );

    break;

  // -----------------------------------
  // Adjustment IN
  // -----------------------------------
  case "ADJUSTMENT":
    if (direction === "IN") {
      const existingValue =
        newPurchaseUnitCost *
        stockQtyInPurchaseUnit;

      const incomingValue =
        purchaseUnitCostN *
        transactionQtyInPurchaseUnit;

      newPurchaseUnitCostStockValue =
        Number(
          (
            existingValue +
            incomingValue
          ).toFixed(2)
        );

      const totalPurchaseQty =
        stockQtyInPurchaseUnit +
        transactionQtyInPurchaseUnit;

      newPurchaseUnitCost =
        totalPurchaseQty > 0
          ? Number(
              (
                newPurchaseUnitCostStockValue /
                totalPurchaseQty
              ).toFixed(2)
            )
          : 0;
    } else {
      // Removing stock
      // Keep purchase unit cost unchanged

      newPurchaseUnitCostStockValue =
        Number(
          (
            newPurchaseUnitCost *
            (afterStock / factor)
          ).toFixed(2)
        );
    }

    break;

  // -----------------------------------
  // Wastage
  // -----------------------------------
  case "WASTAGE":
    // Same as removing stock

    newPurchaseUnitCostStockValue =
      Number(
        (
          newPurchaseUnitCost *
          (afterStock / factor)
        ).toFixed(2)
      );

    break;
}
// console.log("stockQtyInPurchaseUnit -----------------",stockQtyInPurchaseUnit)
// console.log("stocke qty -----------------",stockQtyInPurchaseUnit)
// console.log("purchase qty -----------------",purchaseQtyInPurchaseUnit)
// console.log("newPurchaseUnitCostStockValue -----------------",newPurchaseUnitCostStockValue)
// console.log("newpruchage -----------------",newPurchaseUnitCost)



tx.update(inventoryRef, {
  currentStock: afterStock,
  stockValue: afterStockValue,

  averageCost: afterAverageCost,
  costPrice: afterAverageCost,

  purchaseUnit,
  purchaseUnitCost: newPurchaseUnitCost,

  updatedAt: now,
});

  

    // =====================================================
    // CREATE INVENTORY LEDGER TRANSACTION
    // Stores immutable history of every inventory movement.
    // This NEVER updates inventory totals.
    // =====================================================

    const purchaseQty =
        purchaseQuantity ??
        quantity /
        Number(
            conversionFactor ??
            inventory.conversionFactor ??
            1
        );



    const ledgerRef =
        adminDb.collection("stockLedgerInventory").doc();


        const ledger: InventoryLedgerType = {
          // =====================================================
          // DOCUMENT
          // =====================================================
          transactionId: ledgerRef.id,
        
          // =====================================================
          // INVENTORY ITEM
          // =====================================================
          inventoryItemId,
          inventoryItemName: inventory.name || "",
        
          // =====================================================
          // PARTY
          // =====================================================
          partyId: supplierId || "",
          partyName: supplierName || "",
          partyType: supplierId ? "SUPPLIER" : "SYSTEM",
        
          // =====================================================
          // PURCHASE DETAILS
          // =====================================================
          purchaseQuantity: purchaseQty,
        
          purchaseUnit:  purchaseUnit || inventory.purchaseUnit || inventory.consumptionUnit,
        
          purchaseUnitCost: newPurchaseUnitCost,
        
          // =====================================================
          // TRANSACTION DETAILS
          // =====================================================
          conversionFactor:
            conversionFactor ??
            inventory.conversionFactor ??
            1,
        
          transactionQuantity: quantity,
        
          transactionUnit:
            inventory.consumptionUnit || "gm",
        
          transactionUnitCost: finalUnitCost,
        
          // =====================================================
          // STOCK
          // =====================================================
          beforeStock,
          afterStock,
        
          // =====================================================
          // VALUE
          // =====================================================
          totalAmount: isCostMovement ? totalAmount : 0,
        
          // =====================================================
          // PAYMENT
          // =====================================================
          paidAmount: isCostMovement ? paidAmount : 0,
          dueAmount: isCostMovement ? dueAmount : 0,
        
          paymentStatus: isCostMovement
            ? paymentStatus
            : null,
        
          paymentMethod: isCostMovement
            ? paymentMethod
            : null,
        
          // =====================================================
          // TRANSACTION INFO
          // =====================================================
          referenceType,
          referenceId,
        
          type,
          direction,
        
          note, 
        
          // =====================================================
          // SOURCE
          // =====================================================
          sourceModule: source,
        
          // =====================================================
          // AUDIT
          // =====================================================
          createdById: createdBy,
        
          createdAt: now,
        };
        
        tx.set(ledgerRef, ledger);

    
    return {
        beforeStock,
        afterStock,
        unitCost: finalUnitCost,
    };



}