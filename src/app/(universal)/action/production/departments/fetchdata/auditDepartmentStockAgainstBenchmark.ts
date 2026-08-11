'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function auditDepartmentStockAgainstBenchmark({
benchmarkId,
thresholdPercent = 30,
}: {
benchmarkId: string;
thresholdPercent?: number;
}) {
try {

 
// -----------------------------
// Benchmark record
// -----------------------------
const benchmarkSnap = await adminDb
  .collection('departmentStock')
  .doc(benchmarkId)
  .get();

if (!benchmarkSnap.exists) {
  return {
    success: false,
    message: 'Benchmark record not found',
    data: [],
  };
}

const benchmark = benchmarkSnap.data()!;

const benchmarkCost =
  Number(benchmark.averageCost || 0);

const benchmarkUnit =
  benchmark.purchaseUnit || '';

const inventoryItemId =
  benchmark.inventoryItemId;

// -----------------------------
// All records of same item
// -----------------------------
const snapshot = await adminDb
  .collection('departmentStock')
  .where(
    'inventoryItemId',
    '==',
    inventoryItemId
  )
  .get();

const rows = snapshot.docs.map((doc) => {
  const d = doc.data();

  const avgCost =
    Number(d.averageCost || 0);

  const variancePercent =
    benchmarkCost > 0
      ? Math.abs(avgCost - benchmarkCost) /
        benchmarkCost *
        100
      : 0;

  const purchaseUnit =
    d.purchaseUnit || '';

  // Flag if cost differs too much OR unit differs
  const highlighted =
    variancePercent >= thresholdPercent ||
    purchaseUnit !== benchmarkUnit;

  return {
    id: doc.id,

    departmentName:
      d.departmentName || '',

    inventoryItemName:
      d.inventoryItemName || '',

    purchaseUnit,

    averageCost: avgCost,

    benchmarkAverageCost:
      benchmarkCost,

    variancePercent:
      Number(
        variancePercent.toFixed(2)
      ),

    unitMismatch:
      purchaseUnit !== benchmarkUnit,

    highlighted,
  };
});

return {
  success: true,
  benchmark: {
    id: benchmarkId,
    inventoryItemName:
      benchmark.inventoryItemName,
    purchaseUnit: benchmarkUnit,
    averageCost: benchmarkCost,
  },
  thresholdPercent,
  data: rows,
};
 

} catch (error: any) {
return {
success: false,
message:
error.message || 'Audit failed',
data: [],
};
}
}
