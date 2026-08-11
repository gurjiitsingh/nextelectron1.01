'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function repairAllDepartmentStockValues() {
  try {
    const snapshot = await adminDb
      .collection('departmentStock')
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        updated: 0,
        message: 'No department stock records found.',
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

      const stockValue =
        qtyInPurchaseUnit * averageCost;

      // ✅ Skip if already correct (SAVE WRITES 💰)
      if (Number(data.stockValue || 0) === stockValue) {
        skippedCount++;
        continue;
      }

      bulkWriter.update(doc.ref, {
        stockValue,
        updatedAt: new Date(),
      });

      updatedCount++;
    }

    await bulkWriter.close();

    return {
      success: true,
      updated: updatedCount,
      skipped: skippedCount,
      message: `Updated ${updatedCount}, Skipped ${skippedCount} records.`,
    };

  } catch (error: any) {
    return {
      success: false,
      updated: 0,
      message:
        error.message ||
        'Failed to repair department stock values.',
    };
  }
}