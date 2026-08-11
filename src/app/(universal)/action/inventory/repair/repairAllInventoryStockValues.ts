'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function repairAllInventoryStockValues() {
  try {
    const snapshot = await adminDb
      .collection('inventoryItems')
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        updated: 0,
        skipped: 0,
        message: 'No inventory items found.',
      };
    }

    const bulkWriter = adminDb.bulkWriter();

    let updatedCount = 0;
    let skippedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const currentStock = Number(data.currentStock || 0);
      const averageCost = Number(data.averageCost || 0);
      const conversionFactor = Number(data.conversionFactor || 1);

      const qtyInPurchaseUnit =
        currentStock / conversionFactor;

      // ✅ FIX: Round to 2 decimal places
      const rawStockValue =
        qtyInPurchaseUnit * averageCost;

      const stockValue = Number(
        rawStockValue.toFixed(2)
      );

      const oldStockValue = Number(
        data.stockValue || 0
      );

      // ✅ Compare rounded values
      if (
        Number(oldStockValue.toFixed(2)) ===
        stockValue
      ) {
        skippedCount++;
        continue;
      }

      bulkWriter.update(doc.ref, {
        stockValue,
        updatedAt: FieldValue.serverTimestamp(),
      });

      updatedCount++;
    }

    bulkWriter.onWriteError((error) => {
      console.error('Inventory write failed:', error);
      return true;
    });

    await bulkWriter.close();

    return {
      success: true,
      updated: updatedCount,
      skipped: skippedCount,
      message: `Updated ${updatedCount}, Skipped ${skippedCount} inventory items.`,
    };
  } catch (error: any) {
    return {
      success: false,
      updated: 0,
      skipped: 0,
      message:
        error.message ||
        'Failed to repair inventory stock values.',
    };
  }
}