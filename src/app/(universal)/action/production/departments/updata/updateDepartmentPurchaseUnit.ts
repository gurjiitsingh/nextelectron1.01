'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function updateDepartmentPurchaseUnit({
departmentStockId,
purchaseUnit,
consumptionUnit,
conversionFactor,
}: {
departmentStockId: string;
purchaseUnit: string;
consumptionUnit: string;
conversionFactor: number;
}) {
try {

 
await adminDb
  .collection('departmentStock')
  .doc(departmentStockId)
  .update({
    purchaseUnit,
    consumptionUnit,
    conversionFactor,
    updatedAt: Date.now(),
  });

return { success: true };
 

} catch (error: any) {
return {
success: false,
message:
error.message ||
'Failed to update purchase unit',
};
}
}
