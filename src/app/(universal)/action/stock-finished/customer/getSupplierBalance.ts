"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getSupplierBalance(supplierId: string) {
  const snap = await adminDb
    .collection("ledgerEntries")
    .where("supplierId", "==", supplierId)
    .get();

  let debit = 0;
  let credit = 0;

  snap.forEach((doc) => {
    const d = doc.data();

    if (d.type === "DEBIT") debit += d.amount;
    if (d.type === "CREDIT") credit += d.amount;
  });

  return {
    balance: credit - debit, // payable
    totalPurchase: credit,
    totalPaid: debit,
  };
}