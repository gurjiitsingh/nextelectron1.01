'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function getInventoryPurchaseMappings(
inventoryItemId: string
) {

    console.log("inventoryItemId-----------------",inventoryItemId)

try {
 const id = inventoryItemId;
if (!id) {
  return {
    success: false,
    data: [],
    message: 'inventoryItemId is required',
  };
}

const snap = await adminDb
  .collection('inventoryItems')
  .doc(id)
  .get();

if (!snap.exists) {
  return {
    success: false,
    data: null,
    message: 'Inventory item not found',
  };
}

const item = snap.data()!;

 
//console.log("purchaseMappings-----------------",item)
const purchaseMappings = Array.isArray(item.purchaseMappings)
  ? item.purchaseMappings.map((m: any) => ({
      purchaseUnit: String(m.purchaseUnit || ''),
      consumptionUnit: String(m.consumptionUnit || ''),
      factor: Number(m.factor || 1),
    }))
  : [];

  //console.log("purchaseMappings-----------------",purchaseMappings)

return {
  success: true,
  data: purchaseMappings,
  message: 'Purchase mappings fetched',
};
 

} catch (error: any) {
return {
success: false,
data: [],
message:
error.message ||
'Failed to fetch purchase mappings',
};
}
}
