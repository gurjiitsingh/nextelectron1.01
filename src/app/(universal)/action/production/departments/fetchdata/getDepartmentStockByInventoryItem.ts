'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function getDepartmentStockByInventoryItem(
inventoryItemId: string
) {
try {
if (!inventoryItemId) {
return {
success: false,
data: [],
message: 'inventoryItemId is required',
};
}
console.log("inventoryItemId-------------------",inventoryItemId)

// Get all department stock rows for the item
const stockSnap = await adminDb
  .collection('departmentStock')
  .where('inventoryItemId', '==', inventoryItemId)
  .get();

if (stockSnap.empty) {
  return {
    success: true,
    data: [],
    message: 'No department stock found',
  };
}

const rows = await Promise.all(
  stockSnap.docs.map(async (doc) => {
    const stock = doc.data();

    let departmentName = stock.departmentId;

    // Fetch department name
    if (stock.departmentId) {
      const depSnap = await adminDb
        .collection('departments')
        .doc(stock.departmentId)
        .get();

      if (depSnap.exists) {
        departmentName =
          depSnap.data()?.name || departmentName;
      }
    }

    return {
      id: doc.id,
      departmentId: stock.departmentId || '',
      departmentName,

      inventoryItemId: stock.inventoryItemId || '',
      inventoryItemName: stock.inventoryItemName || '',

      currentStock: Number(stock.currentStock || 0),
      quantity: Number(stock.quantity || 0),

      averageCost: Number(stock.averageCost || 0),
      stockValue: Number(stock.stockValue || 0),

      purchaseUnit: stock.purchaseUnit || '',
      consumptionUnit: stock.consumptionUnit || '',
      conversionFactor: Number(stock.conversionFactor || 1),

      purchaseUnitCost: Number(stock.purchaseUnitCost || 0),

      updatedAt: stock.updatedAt
  ? stock.updatedAt.toDate().toISOString()
  : null,
    };
  })
);

// Totals
const totals = rows.reduce(
  (acc, row) => {
    acc.currentStock += row.currentStock;
    acc.stockValue += row.stockValue;
    return acc;
  },
  { currentStock: 0, stockValue: 0 }
);

return {
  success: true,
  data: rows,
  totals,
  message: `Found ${rows.length} department records`,
};


} catch (error: any) {
return {
success: false,
data: [],
message:
error.message ||
'Failed to fetch department stock',
};
}
}
