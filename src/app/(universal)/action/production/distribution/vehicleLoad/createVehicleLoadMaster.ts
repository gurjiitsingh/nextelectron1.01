'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { VehicleLoadStatus } from '@/lib/types/distribution/VehicleLoadStatus';

import admin from 'firebase-admin';

type CreateVehicleLoadMasterInput = {
  loadId: string;
  loadNo: string;
  tripId: string;
  routeId: string;
  routeName: string;
  vehicleId: string;
  vehicleName: string;
  locationCode?: string;
  responsiblePerson?: string;
  remarks?: string;
  createdBy?: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  status: VehicleLoadStatus
};

export async function createVehicleLoadMaster(
  tx: FirebaseFirestore.Transaction,
  input: CreateVehicleLoadMasterInput
) {
  const ref = adminDb
    .collection('vehicleLoads')
    .doc(input.loadId);

  tx.set(ref, {
    loadId: input.loadId,
    loadNo:input.loadNo,
    vehicleId: input.vehicleId,
    vehicleName: input.vehicleName,
    locationCode: input.locationCode || '',
    responsiblePerson: input.responsiblePerson || '',
    remarks: input.remarks || '',
    createdBy: input.createdBy || '',
    totalItems: input.totalItems,
    totalQuantity: input.totalQuantity,
    totalValue: input.totalValue,
    status: 'LOADED',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return ref;
}