'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function fixItemAverageCost(id: string) {
  try {
    const docRef = adminDb
      .collection('inventoryItems')
      .doc(id);

    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        success: false,
        message: 'Item not found',
      };
    }

    const data = doc.data();

    const purchaseUnitCost = Number(
      data?.purchaseUnitCost || 0
    );

    const newAvgCost = Number(
      purchaseUnitCost.toFixed(2)
    );

    const oldAvgCost = Number(
      data?.averageCost || 0
    );

    // ✅ Skip if already same
    if (
      Number(oldAvgCost.toFixed(2)) === newAvgCost
    ) {
      return {
        success: true,
        message: 'Already correct',
      };
    }

    await docRef.update({
      averageCost: newAvgCost,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Average cost updated',
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message ||
        'Failed to update average cost',
    };
  }
}