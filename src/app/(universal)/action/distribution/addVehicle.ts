'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { StorageType } from '@/lib/types/distribution/StorageType';
import { revalidatePath, revalidateTag } from 'next/cache';

export type AddVehicleType = {
  locationCode: string;
  name: string;
  type: StorageType;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  capacity?: number;
  remarks?: string;
};

export async function addVehicle({
  locationCode,
  name,
  type,
  responsiblePersonId,
  responsiblePersonName,
  capacity,
  remarks,
}: AddVehicleType) {
  try {
    // Remove all spaces and make uppercase
    const normalizedCode = locationCode
      .replace(/\s+/g, '')
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      return {
        success: false,
        message: 'Vehicle number is required.',
      };
    }

    if (!name.trim()) {
      return {
        success: false,
        message: 'Vehicle name is required.',
      };
    }

    // Check duplicate using normalized code
    const existing = await adminDb
      .collection('stockLocations')
      .where(
        'locationCode',
        '==',
        normalizedCode
      )
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        message: 'Vehicle already exists.',
      };
    }

    const ref = adminDb
      .collection('stockLocations')
      .doc();

    await ref.set({
      id: ref.id,

      // Save normalized code
      locationCode: normalizedCode,
      name: name.trim(),

      type,

      responsiblePersonId:
        responsiblePersonId || '',
      responsiblePersonName:
        responsiblePersonName || '',

      capacity: capacity || 0,
      remarks: remarks || '',

      active: true,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    revalidateTag('vehicles', 'max');
    revalidatePath(
      '/admin/distribution/vehicles'
    );

    return {
      success: true,
      message: 'Vehicle added successfully.',
    };
  } catch (error: any) {
    console.error('❌ addVehicle:', error);

    return {
      success: false,
      message:
        error.message ||
        'Failed to add vehicle.',
    };
  }
}