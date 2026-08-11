'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function updateInventoryPurchaseUnit(
itemId: string,
purchaseUnit: string,
consumptionUnit: string,
conversionFactor: number
) {

    
try {

await adminDb.collection('inventoryItems').doc(itemId).update({
purchaseUnit,
consumptionUnit,
conversionFactor,
//updatedAt: Date.now(),


});

 
return { success: true };
 

} catch (error: any) {
return {
success: false,
message: error.message ?? 'Failed to update purchase unit',
};
}
}
