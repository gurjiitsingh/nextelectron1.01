"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getCustomerLedgerByLimit({
  customerId,
}: {
  customerId: string;
}) {
  try {
    // ===============================
    // FETCH LATEST 20 TRANSACTIONS
    // ===============================

    const snap = await adminDb
      .collection("customerLedger")
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const transactions = snap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,

        date: d.createdAt?.toDate() ?? null,

        type: d.type,

        note: d.note ?? "",

        paymentMethod: d.paymentMethod ?? "",

        totalAmount: Number(d.totalAmount ?? 0),
        returnAmount: Number(d.returnAmount ?? 0),
        paidAmount: Number(d.paidAmount ?? 0),
creditUsed: Number(d.creditUsed ?? 0),
        dueAmount: Number(d.dueAmount ?? 0),
        creditAmount: Number(d.creditAmount ?? 0),
        previousBalance: Number(
          d.previousBalance ?? 0
        ),

        balanceChange: Number(
          d.balanceChange ?? 0
        ),

        balance: Number(d.balance ?? 0),
      };
    });

    return {
      success: true,
      transactions,
    };
  } catch (error) {
    console.error(
      "❌ getCustomerLedger failed:",
      error
    );

    return {
      success: false,
      transactions: [],
    };
  }
}