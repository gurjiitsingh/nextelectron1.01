"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type InventoryDashboardType = {
  totalItems: number;

  lowStockItems: number;

  negativeStockItems: number;

  totalStockValue: number;

  recentTransactions: any[];

  lowStockList: any[];
};

export async function fetchInventoryDashboard(): Promise<InventoryDashboardType> {
  try {
    // =====================================================
    // FETCH INVENTORY ITEMS
    // =====================================================

    const inventorySnapshot =
      await adminDb
        .collection("inventoryItems")
        .get();

    let totalItems = 0;

    let lowStockItems = 0;

    let negativeStockItems = 0;

    let totalStockValue = 0;

    const lowStockList: any[] = [];

    inventorySnapshot.docs.forEach(
      (doc) => {
        const data = doc.data();

        totalItems++;

        const currentStock =
          Number(
            data.currentStock
          ) || 0;

        const minStock =
          Number(
            data.minStock
          ) || 0;

        const costPrice =
          Number(
            data.costPrice
          ) || 0;

        // =================================================
        // LOW STOCK
        // =================================================

        if (
          currentStock <= minStock
        ) {
          lowStockItems++;

          lowStockList.push({
            id: doc.id,

            name: data.name,

            currentStock,

            minStock,

            unit: data.unit,
          });
        }

        // =================================================
        // NEGATIVE STOCK
        // =================================================

        if (currentStock < 0) {
          negativeStockItems++;
        }

        // =================================================
        // STOCK VALUE
        // =================================================

        totalStockValue +=
          currentStock * costPrice;
      }
    );

    // =====================================================
    // RECENT TRANSACTIONS
    // =====================================================

    const transactionSnapshot =
      await adminDb
        .collection(
          "inventoryTransactions"
        )
        .orderBy(
          "createdAt",
          "desc"
        )
        .limit(20)
        .get();

    const recentTransactions =
      transactionSnapshot.docs.map(
        (doc) => ({
          id: doc.id,

          ...doc.data(),
        })
      );

    // =====================================================
    // RETURN DATA
    // =====================================================

    return {
      totalItems,

      lowStockItems,

      negativeStockItems,

      totalStockValue,

      recentTransactions,

      lowStockList,
    };
  } catch (error) {
    console.error(
      "❌ fetchInventoryDashboard failed:",
      error
    );

    return {
      totalItems: 0,

      lowStockItems: 0,

      negativeStockItems: 0,

      totalStockValue: 0,

      recentTransactions: [],

      lowStockList: [],
    };
  }
}