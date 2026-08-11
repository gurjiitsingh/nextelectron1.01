// lib/firestore/categoryClient.ts (DO NOT mark with "use server")

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { categoryType } from '@/lib/types/categoryType';

export const fetchCategoriesClient = async (): Promise<categoryType[]> => {
  const result = await getDocs(collection(db, 'category'));
  return result.docs.map((doc) => ({ id: doc.id, ...doc.data() } as categoryType));
};
