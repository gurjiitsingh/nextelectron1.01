'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';
import { PaymentMethodType } from '@/lib/types/distribution/PaymentMethodType';

type Props = {
  saleId: string;
  tripId: string;

  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT';
  paymentMethod?: PaymentMethodType;

  paidAmount: number;
  dueAmount: number;

  remarks?: string;
  createdBy?: string;

  totalItems: number;
  totalQuantity: number;
};

export async function createTruckSaleMaster(
  tx: admin.firestore.Transaction,
  data: Props
) {
  const ref = adminDb
    .collection('truckSales')
    .doc(data.saleId);

  tx.set(ref, {
    ...data,

    paymentMethod: data.paymentMethod || null,
    remarks: data.remarks || '',
    createdBy: data.createdBy || '',

    status: 'COMPLETED',

    createdAt: new Date(),
  });
}