'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { DepartmentType } from '@/lib/types/department/DepartmentType';

export async function getDepartmentById(
  id: string
): Promise<DepartmentType | null> {

    console.log("id------------",id)

  if (!id) return null;

  const doc = await adminDb
    .collection('departments')
    .doc(id)
    .get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...(doc.data() as Omit<DepartmentType, 'id'>),
  };
}