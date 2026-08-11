'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function getVehicleLoads() {
  const snapshot = await adminDb
    .collection('vehicleLoads')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}