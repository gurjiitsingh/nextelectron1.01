'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function clearVehicleLoads() {
  try {
    const snapshot = await adminDb
      .collection('vehicleLoads')
      .get();

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      message: `Deleted ${snapshot.size} vehicle load records.`,
    };
  } catch (error: any) {
    console.error('clearVehicleLoads:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to clear vehicle loads.',
    };
  }
}