'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function updateInventoryField(
itemId: string,
field: 'currentStock' | 'averageCost',
value: number
) {
try {
const ref = adminDb.collection('inventoryItems').doc(itemId);


const snap = await ref.get();

if (!snap.exists) {
  return {
    success: false,
    message: `Item not found: ${itemId}`,
  };
}

const data = snap.data() || {};

// Current values from Firestore
let currentStock = Number(data.currentStock || 0);
let averageCost = Number(data.averageCost || 0);
let conversionFactor = Number(data.conversionFactor || 0);

// Replace the edited field
if (field === 'currentStock') {
  currentStock = value;
}

if (field === 'averageCost') {
  averageCost = value;
}

// Recalculate stock value
const stockValue = (currentStock * averageCost)/conversionFactor;

await ref.update({
  [field]: value,
  stockValue,
  updatedAt: Date.now(),
});

return {
  success: true,
  stockValue,
};


} catch (error: any) {
return {
success: false,
message: error.message ?? 'Update failed',
};
}
}
