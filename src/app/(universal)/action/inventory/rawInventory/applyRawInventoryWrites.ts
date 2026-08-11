"use server";

 
import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";
import { InventoryLedgerType } from "@/lib/types/inventory/InventoryLedgerType";
import admin from "firebase-admin";

export async function applyRawInventoryWrites(
  tx: FirebaseFirestore.Transaction,
  updates: RawInventoryUpdate[],
  orderId: string,
  type: string,
  direction: "OUT" | "IN" = "OUT",
  note: string = "Consumed in production",
  createdBy: string = "system",
  source: string = "PRODUCTION",
) {
 const now = admin.firestore.FieldValue.serverTimestamp();

  //console.log('tr updates-------------------------',updates)
  let totalRawMaterialCost = 0;

  for (const u of updates) {
    // =====================================
    // Cost of this inventory item
    // =====================================

    const consumedValue =
      (Number(u.sendQty) || 0) *
      (Number(u.unitCost) || 0);

    totalRawMaterialCost += consumedValue;

    const newStockValue = Math.max(
      0,
      (Number(u.storeStockValue) || 0) - consumedValue
    );

    tx.update(u.ref, {
      currentStock: u.afterStock,
      stockValue: Number(newStockValue.toFixed(2)),
      updatedAt: now,
    });

    // =====================================
    // Ledger
    // =====================================

    const ledgerRef =
      adminDb.collection("stockLedgerInventory").doc();

 const ledger: InventoryLedgerType = {
  transactionId: ledgerRef.id,

  // INVENTORY ITEM
  inventoryItemId: u.inventoryItemId,
  inventoryItemName: u.inventoryItemName,

  // PARTY
  partyId: "",
  partyName: "",
  partyType: "SYSTEM",

  // PURCHASE
  purchaseQuantity: 0,
  purchaseUnit: u.purchaseUnit,
  purchaseUnitCost: 0,

  // TRANSACTION
  conversionFactor: u.conversionFactor,
  transactionQuantity: u.sendQty,
  transactionUnit: u.transactionUnit,
  transactionUnitCost: u.unitCost,

  // STOCK
  beforeStock: u.beforeStock, 
  afterStock: u.afterStock,

  // VALUE
  totalAmount: Number(consumedValue.toFixed(2)),

  // PAYMENT
  paidAmount: 0,
  dueAmount: 0,
  paymentStatus: null,
  paymentMethod: null,

  // TRANSACTION INFO
  referenceType: "PRODUCTION",
  referenceId: orderId,

  type,
  direction,
  note,

  // AUDIT
  createdById: createdBy,
  sourceModule: source,

  createdAt: now,
};

tx.set(ledgerRef, ledger);
  }

  return Number(totalRawMaterialCost.toFixed(2));
}


