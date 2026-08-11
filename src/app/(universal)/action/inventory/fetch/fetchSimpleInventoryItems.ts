'use server';

import { adminDb } from '@/lib/firebaseAdmin';

type SimpleInventoryItem = {
  id: string;
  name: string;
  purchaseUnit: string;
  purchaseUnitCost: number; // ✅ ADD THIS
  averageCost: number;
  stockValue: number;
};

export async function fetchSimpleInventoryItems(): Promise<SimpleInventoryItem[]> {
  try {
    const snapshot = await adminDb
      .collection('inventoryItems')
      .get();

    if (snapshot.empty) return [];

    const items: SimpleInventoryItem[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name ?? '',
        purchaseUnit: data.purchaseUnit ?? '',

        // ✅ IMPORTANT FIX
        purchaseUnitCost: Number(data.purchaseUnitCost ?? 0),

        averageCost: Number(data.averageCost ?? 0),
        stockValue: Number(data.stockValue ?? 0),
      };
    });

    return items;
  } catch (error) {
    console.error('Fetch inventory error:', error);
    return [];
  }
}