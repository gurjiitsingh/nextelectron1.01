'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function updateInventoryAverageCost({
  id,
  averageCost,
}: {
  id: string;
  averageCost: number;
}) {
  try {
    if (!id) {
      return {
        success: false,
        message: 'Inventory item id is required',
      };
    }

    const ref = adminDb.collection('inventoryItems').doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return {
        success: false,
        message: 'Inventory item not found',
      };
    }

    const item = snap.data()!;

    const currentStock = Number(item.currentStock || 0);
    const conversionFactor = Number(item.conversionFactor || 1);

    // quantity in purchase unit
    const qtyInPurchaseUnit =
      currentStock / conversionFactor;

    const stockValue =
      qtyInPurchaseUnit * Number(averageCost || 0);
     // console.log("stock value++++++++++++++----------------------",stockValue)

    await ref.update({
      averageCost: Number(averageCost || 0),
      stockValue,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      stockValue,
      message: 'Inventory average cost updated',
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message ||
        'Failed to update inventory average cost',
    };
  }
}