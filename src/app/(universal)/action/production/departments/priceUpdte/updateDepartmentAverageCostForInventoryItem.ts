'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function updateAllDepartmentAverageCosts() {
  try {
    // ==========================================
    // LOAD ALL INVENTORY ITEMS (MAP)
    // ==========================================

    const inventorySnapshot = await adminDb
      .collection('inventoryItems')
      .get();

    if (inventorySnapshot.empty) {
      return {
        success: true,
        updated: 0,
        skipped: 0,
        message: 'No inventory items found.',
      };
    }

    const inventoryMap = new Map<string, number>();

    for (const doc of inventorySnapshot.docs) {
      const avg = Number(doc.data().averageCost);

      if (Number.isFinite(avg)) {
        inventoryMap.set(doc.id, avg);
      }
    }

    // ==========================================
    // LOAD ALL DEPARTMENT STOCK (ONLY ONCE)
    // ==========================================

    const departmentSnapshot = await adminDb
      .collection('departmentStock')
      .get();

    if (departmentSnapshot.empty) {
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

    // ==========================================
    // PROCESS ALL DEPARTMENT STOCK
    // ==========================================

    for (const doc of departmentSnapshot.docs) {
      const data = doc.data();

      const inventoryItemId = data.inventoryItemId;

      const newAverageCost =
        inventoryMap.get(inventoryItemId);

      // Skip if no matching inventory
      if (!newAverageCost) {
        skipped++;
        continue;
      }

      const oldAverageCost =
        Number(data.averageCost || 0);

      // 💰 Skip unchanged
      if (oldAverageCost === newAverageCost) {
        skipped++;
        continue;
      }

      bulkWriter.update(doc.ref, {
        averageCost: newAverageCost,
        updatedAt: FieldValue.serverTimestamp(),
      });

      updated++;
    }

    // ==========================================
    // ERROR HANDLING
    // ==========================================

    bulkWriter.onWriteError((error) => {
      console.error('Write failed:', error);
      return true; // retry
    });

    await bulkWriter.close();

    return {
      success: true,
      updated,
      skipped,
      message: `Updated ${updated}, Skipped ${skipped} department records.`,
    };
  } catch (error: any) {
    return {
      success: false,
      updated: 0,
      skipped: 0,
      message:
        error.message ||
        'Failed to update department stock costs.',
    };
  }
}