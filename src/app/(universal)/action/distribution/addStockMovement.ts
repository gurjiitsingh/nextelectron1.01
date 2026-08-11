'use server';

import { Transaction } from 'firebase-admin/firestore';
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export type AddStockMovementProps = {
  tx: Transaction;

  movementType:
    | 'TRANSFER'
    | 'SALE'
    | 'RETURN'
    | 'ADJUSTMENT';

  productId: string;
  batchId: string;
  productName: string;

  customerId?: string;
  customerName?: string;
vehicleId?:string;
tripId: string;
  locationCode: string;
  responsiblePerson: string;
  quantity: number;
  wholesalePrice?: number,
  name: string;

  fromLocationType: string;
  fromLocationRef: string;

  toLocationType: string;
  toLocationRef: string;

  remarks?: string;
  createdBy?: string;
};

export async function addStockMovement({
  tx,
  movementType,

  productId,
  batchId,
  tripId,
  productName,

  customerName,
  customerId,
vehicleId,
  locationCode,
  responsiblePerson,
  quantity,
  name,
  wholesalePrice,

  fromLocationType,
  fromLocationRef,

  toLocationType,
  toLocationRef,

  remarks,
  createdBy,
}: AddStockMovementProps) {
  const ref = adminDb
    .collection('stockMovements')
    .doc();

 

  // YYYY-MM-DD (India timezone optional)
const now = new Date();

// India date string: YYYY-MM-DD
const movementDate = new Intl.DateTimeFormat(
  'en-CA',
  {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
).format(now);

  tx.set(ref, {
    id: ref.id,

    movementType,

    productId,
    batchId,
     tripId,
    productName,

    customerName: customerName || '',
    customerId: customerId || '',
vehicleId,
    locationCode,
    responsiblePerson,
    quantity,
    wholesalePrice,
    name,

    fromLocationType,
    fromLocationRef,

    toLocationType,
    toLocationRef,

    remarks: remarks ?? '',
    createdBy: createdBy ?? 'system',

    // New searchable date field
    movementDate,

    // Keep timestamp for exact time
     createdAt:
    admin.firestore.FieldValue.serverTimestamp(),
  });
}