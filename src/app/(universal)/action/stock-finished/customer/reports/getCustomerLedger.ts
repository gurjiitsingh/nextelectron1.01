"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getCustomerLedger({
  customerId,
  fromDate,
  toDate,
}: {
  customerId: string;
  fromDate?: string;
  toDate?: string;
}) {
  try {
    // ===============================
    // MAIN QUERY
    // ===============================

    let query = adminDb
      .collection("customerLedger")
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "asc");

    // ===============================
    // DATE FILTER
    // ===============================

    if (!fromDate && !toDate) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      query = query
        .where("createdAt", ">=", todayStart)
        .where("createdAt", "<=", todayEnd);
    } else {
      if (fromDate) {
        query = query.where(
          "createdAt",
          ">=",
          new Date(fromDate)
        );
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);

        query = query.where(
          "createdAt",
          "<=",
          end
        );
      }
    }

    // ===============================
    // FETCH DATA
    // ===============================

    const snap = await query.get();

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

        dueAmount: Number(d.dueAmount ?? 0),
        creditAmount: Number(d.creditAmount ?? 0),
        creditUsed: Number(d.creditUsed ?? 0),
        previousBalance: Number(
          d.previousBalance ?? 0
        ),

        balanceChange: Number(
          d.balanceChange ?? 0
        ),

        balance: Number(d.balance ?? 0),
      };
    });

    // Latest first for UI
    transactions.reverse();

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