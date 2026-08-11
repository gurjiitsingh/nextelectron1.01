'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function repairDepartmentStockValuesUsingOwnCost() {
  try {
    const snapshot = await adminDb
      .collection('departmentStock')
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        updated: 0,
        skipped: 0,
        message: 'No department stock found.',
      };
    }

    const bulkWriter = adminDb.bulkWriter();

    let updated = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const currentStock = Number(data.currentStock || 0);
      const conversionFactor = Number(data.conversionFactor || 1);
      const averageCost = Number(data.averageCost || 0);

      // ✅ calculate stock value
      const qtyInPurchaseUnit =
        currentStock / conversionFactor;

      const newStockValue =
        qtyInPurchaseUnit * averageCost;

      const oldStockValue =
        Number(data.stockValue || 0);

      // 💰 skip unchanged
      if (oldStockValue === newStockValue) {
        skipped++;
        continue;
      }

      bulkWriter.update(doc.ref, {
        stockValue: newStockValue,
        updatedAt: FieldValue.serverTimestamp(),
      });

      updated++;
    }

    bulkWriter.onWriteError((error) => {
      console.error('Write failed:', error);
      return true;
    });

    await bulkWriter.close();

    return {
      success: true,
      updated,
      skipped,
      message: `Updated ${updated}, Skipped ${skipped} department stock records.`,
    };
  } catch (error: any) {
    return {
      success: false,
      updated: 0,
      skipped: 0,
      message:
        error.message ||
        'Failed to repair department stock values.',
    };
  }
}