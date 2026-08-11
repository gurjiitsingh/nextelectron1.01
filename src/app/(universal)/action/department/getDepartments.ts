"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentType } from "@/lib/types/department/DepartmentType";
 

export async function getDepartments(): Promise<DepartmentType[]> {
  const data: DepartmentType[] = [];

  const snapshot = await adminDb
    .collection("departments")
    .orderBy("createdAt", "desc")
    .get();

  snapshot.forEach((doc) => {
    data.push(doc.data() as DepartmentType);
  });

  return data;
}