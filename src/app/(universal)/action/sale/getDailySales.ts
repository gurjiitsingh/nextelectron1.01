import { adminDb } from '@/lib/firebaseAdmin';

export type DailySales = {
  date: string;
  totalSales: number;
  orderCount: number;
};

export async function getDailySales(): Promise<DailySales[]> {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );

  const snapshot = await adminDb
    .collection('orderMaster')
    .where('createdAt', '>=', startOfMonth)
    .where('createdAt', '<', startOfNextMonth)
    .orderBy('createdAt', 'desc')
    .get();

  const salesMap: Record<string, DailySales> = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();

    if (data.orderStatus !== 'COMPLETED') return;

    const createdAt = data.createdAt?.toDate?.();

    if (!createdAt) return;

    const dateKey = `${createdAt.getFullYear()}-${String(
      createdAt.getMonth() + 1
    ).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;

    if (!salesMap[dateKey]) {
      salesMap[dateKey] = {
        date: dateKey,
        totalSales: 0,
        orderCount: 0,
      };
    }

    salesMap[dateKey].totalSales += Number(data.grandTotal || 0);
    salesMap[dateKey].orderCount += 1;
  });

  return Object.values(salesMap).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}

export async function getDailySales1(): Promise<DailySales[]> {
  const snapshot = await adminDb
    .collection('orderMaster')
    .orderBy('createdAt', 'desc')
    .get();

  const salesMap: Record<string, DailySales> = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();

    if (data.orderStatus !== 'COMPLETED') return;

    const createdAt = data.createdAt?.toDate?.();

    if (!createdAt) return;

    const dateKey = `${createdAt.getFullYear()}-${String(
      createdAt.getMonth() + 1
    ).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;

    if (!salesMap[dateKey]) {
      salesMap[dateKey] = {
        date: dateKey,
        totalSales: 0,
        orderCount: 0,
      };
    }

    salesMap[dateKey].totalSales += Number(data.grandTotal || 0);
    salesMap[dateKey].orderCount += 1;
  });

  return Object.values(salesMap).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}
