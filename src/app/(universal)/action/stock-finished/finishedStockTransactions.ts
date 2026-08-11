"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type Props = {
  page?: number;
};

const PAGE_SIZE = 14;


export async function getfinishedStockTransactions({
  page = 1,
}: Props = {}) {
  console.log(
    "Fetching finished stock transactions..."
  );

  try {
    const snapshot = await adminDb
      .collection("stockLedgerFinished")
      .orderBy("createdAt", "desc")
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)
      .get();

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        // Product
        productId: data.productId || "",
        productName: data.productName || "",

        // Transaction
        type: data.type || "",
        direction: data.direction || "",

        // Quantity
        quantity: Number(data.quantity || 0),
        transactionUnit:
          data.transactionUnit || "",

        // Pricing
        unitPrice: Number(data.unitPrice || 0),
        totalAmount: Number(
          data.totalAmount || 0
        ),

        // Stock
        beforeStock: Number(
          data.beforeStock || 0
        ),
        afterStock: Number(
          data.afterStock || 0
        ),

        // Payment
        paidAmount: Number(
          data.paidAmount || 0
        ),
        dueAmount: Number(
          data.dueAmount || 0
        ),
        paymentStatus:
          data.paymentStatus || "",
        paymentMethod:
          data.paymentMethod || "",

        // Customer
        customerId:
          data.customerId || "",
        customerName:
          data.customerName || "",

        // Reference
        referenceId:
          data.referenceId || "",
        referenceType:
          data.referenceType || "",

        // Meta
        note: data.note || "",
        createdBy:
          data.createdBy || "",
        source: data.source || "",

        createdAt: data.createdAt?._seconds
          ? data.createdAt._seconds * 1000
          : null,
      };
    });

    return {
      success: true,
      data: transactions,
      hasMore:
        snapshot.size === PAGE_SIZE,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: [],
      hasMore: false,
    };
  }
}