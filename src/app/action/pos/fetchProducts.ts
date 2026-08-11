'use client';

import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ProductType } from '@/lib/types/productType';

export async function fetchProductsClient(): Promise<ProductType[]> {
  const q = query(collection(db, 'products'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Partial<ProductType> & {
      updatedAt?: any;
    };

    return {
      id: doc.id,
      name: data.name ?? '',
      price: data.price ?? 0,
      currentStock: data.currentStock ?? 0,
      discountPrice: data.discountPrice ?? 0,
      categoryId: data.categoryId ?? '',
      masterCategoryId: data.masterCategoryId ?? '',
      masterCategoryName: data.masterCategoryName ?? '',
      parentId: data.parentId ?? '',
      hasVariants: data.hasVariants ?? false,
      hasModifier: data.hasModifier ?? false,
      type: data.type ?? 'parent',
      productCat: data.productCat ?? '',
      flavors: data.flavors ?? false,
      publishStatus: data.publishStatus ?? 'published',
      stockStatus: data.stockStatus ?? 'out_of_stock',
      baseProductId: data.baseProductId ?? '',
      productDesc: data.productDesc ?? '',
      sortOrder: data.sortOrder ?? 0,
      image: data.image ?? '',
      isFeatured: data.isFeatured ?? false,
      purchaseSession: data.purchaseSession ?? null,
      quantity: data.currentStock ?? null,
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate().toISOString()
        : null,
      searchCode: data.searchCode ?? '',
      taxRate: data.taxRate,
      taxType: data.taxType,
    };
  });
}