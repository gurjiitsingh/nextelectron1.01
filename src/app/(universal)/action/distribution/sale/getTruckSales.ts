'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { TruckSaleReportType } from '@/lib/types/distribution/TruckSaleReportType';

export async function getTruckSales(): Promise<
  TruckSaleReportType[]
> {
  const snap = await adminDb
    .collection('truckSales')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map((doc) => ({
    ...(doc.data() as Omit<
      TruckSaleReportType,
      'items'
    >),
    items: [],
  }));
}