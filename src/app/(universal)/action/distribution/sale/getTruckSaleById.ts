'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { TruckSaleItemType, TruckSaleReportType } from '@/lib/types/distribution/TruckSaleReportType';


export async function getTruckSaleById(
  saleId: string
): Promise<TruckSaleReportType | null> {
  const saleDoc = await adminDb
    .collection('truckSales')
    .doc(saleId)
    .get();

  if (!saleDoc.exists) {
    return null;
  }

  const itemsSnap = await adminDb
    .collection('truckSales')
    .doc(saleId)
    .collection('items')
    .get();

  const items: TruckSaleItemType[] =
    itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TruckSaleItemType, 'id'>),
    }));

  return {
    ...(saleDoc.data() as Omit<
      TruckSaleReportType,
      'items'
    >),
    items,
  };
}