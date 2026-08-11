"use server";

import { adminDb } from "@/lib/firebaseAdmin";

const PAGE_SIZE = 20;

interface Props {
  page?: number;
}

export async function getDepartmentStockTransactions({
  page = 1,
}: Props) {
  try {
    const snapshot = await adminDb
      .collection("departmentStockTransactions")
      .orderBy("createdAt", "desc")
      .get();

    const all = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ??
          data.createdAt ??
          null,
      };
    });

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return {
      success: true,
      data: all.slice(start, end),
      hasMore: end < all.length,
    };
  } catch (error: any) {
    console.error(
      "❌ getDepartmentStockTransactions:",
      error
    );

    return {
      success: false,
      data: [],
      hasMore: false,
      message:
        error.message ||
        "Failed to load department stock transactions.",
    };
  }
}