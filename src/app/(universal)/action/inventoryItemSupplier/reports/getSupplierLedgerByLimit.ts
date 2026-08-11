"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getSupplierLedgerByLimit({
  supplierId,
  fromDate,
  toDate,
}: {
  supplierId: string;
  fromDate?: string;
  toDate?: string;
}) {
  try {
    let query = adminDb
      .collection("supplierLedger")
      .where("supplierId", "==", supplierId)
      .orderBy("createdAt", "desc");

    // ==========================
    // LAST 20 (no date filter)
    // ==========================
    if (!fromDate && !toDate) {
      query = query.limit(20);
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
      "❌ getSupplierLedgerByLimit failed:",
      error
    );

    return {
      success: false,
      transactions: [],
    };
  }
}