'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { StockMovementType } from '@/lib/types/distribution/StockMovementType';

export async function getStockMovements() {
  try {
    const snapshot = await adminDb
      .collection('stockMovements')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        movementType:
          data.movementType || '',

        productId: data.productId || '',
        batchId: data.batchId || '',
        productName:
          data.productName || '',

        // required fields
        productMode:
          data.productMode ||
          'finished_stock',

        customerName:
          data.customerName || '',
        customerId:
          data.customerId || '',

        locationCode:
          data.locationCode || '',
        responsiblePerson:
          data.responsiblePerson || '',

        quantity: Number(
          data.quantity || 0
        ),

        name: data.name || '',

        fromLocationType:
          data.fromLocationType || '',
        fromLocationRef:
          data.fromLocationRef || '',

        // required field
        fromLocationName:
          data.fromLocationName || '',

        toLocationType:
          data.toLocationType || '',
        toLocationRef:
          data.toLocationRef || '',

        // required field
        toLocationName:
          data.toLocationName || '',

        remarks: data.remarks || '',

        createdBy:
          data.createdBy || '',

        movementDate:
          data.movementDate || '',

        createdAt: data.createdAt?.toDate
          ? data.createdAt
              .toDate()
              .toISOString()
          : null,
      } satisfies StockMovementType;
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}