"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryLedgerType } from "@/lib/types/inventory/InventoryLedgerType";

type Props = {
  page?: number;
};

const PAGE_SIZE = 14;

export async function getInventoryTransactions({
  page = 1,
}: Props = {}) {
  try {
    const snapshot = await adminDb
      .collection("stockLedgerInventory")
      .orderBy("createdAt", "desc")
      .offset((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE + 1)
      .get();

    const docs = snapshot.docs;

    const hasMore = docs.length > PAGE_SIZE;

    const trimmedDocs = hasMore
      ? docs.slice(0, PAGE_SIZE)
      : docs;

    const transactions = trimmedDocs.map((doc) => {
      const data = doc.data() as InventoryLedgerType;

      return {
        id: doc.id,

        // =====================================================
        // ITEM
        // =====================================================
        inventoryItemName: data.inventoryItemName,

        // =====================================================
        // TRANSACTION
        // =====================================================
        type: data.type,
        direction: data.direction,

        // =====================================================
        // PARTY (renamed)
        // =====================================================
        partyName: data.partyName,
        partyType: data.partyType,

        // =====================================================
        // MOVEMENT (renamed)
        // =====================================================
        quantity: data.quantity,
        unit: data.transactionUnit,
        unitCost: data.transactionUnitCost,

        // =====================================================
        // PURCHASE
        // =====================================================
        purchaseQuantity: data.purchaseQuantity,
        purchaseUnit: data.purchaseUnit,
        purchaseUnitCost: data.purchaseUnitCost,
        conversionFactor: data.conversionFactor,

        // =====================================================
        // STOCK
        // =====================================================
        beforeStock: data.beforeStock,
        afterStock: data.afterStock,

        // =====================================================
        // VALUE
        // =====================================================
        totalAmount: data.totalAmount,

        // =====================================================
        // AUDIT
        // =====================================================
        createdBy: data.createdByName ?? data.createdById,

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
      hasMore,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: [],
      hasMore: false,
    };
  }
}