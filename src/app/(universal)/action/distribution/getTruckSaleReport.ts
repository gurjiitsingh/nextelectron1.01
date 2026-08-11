'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import type { Query } from 'firebase-admin/firestore';

type Props = {
  locationCode?: string; // vehicle/location
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

export async function getTruckSaleReport({
  locationCode,
  from,
  to,
}: Props = {}) {

  console.log("locationCode------------------",locationCode)
  try {
    const today = new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).format(new Date());

    const fromDate = from || today;
    const toDate = to || today;

    let query: Query = adminDb.collection(
      'stockMovements'
    );

    //Filter by vehicle/location
    if (locationCode) {
      query = query.where(
        'locationCode',
        '==',
        locationCode
      );
    }

    // Date range filter
    query = query
      .where(
        'movementDate',
        '>=',
        fromDate
      )
      .where(
        'movementDate',
        '<=',
        toDate
      )
      .orderBy('movementDate', 'desc');

    const snap = await query.get();

    return snap.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        batchId: data.batchId || '',
        productName: data.productName || '',
        quantity: Number(data.quantity || 0),

        customerName: data.customerName || '',
        customerId: data.customerId || '',

        vehicleName: data.name || '',
        locationCode: data.locationCode || '',
vehicleId: data.vehicleId || '',
        createdBy: data.createdBy || '',

        createdAt: data.createdAt?.toDate
          ? data.createdAt
              .toDate()
              .toISOString()
          : null,
      };
    });
  } catch (error) {
    console.error(
      'getTruckSaleReport error:',
      error
    );
    return [];
  }
}