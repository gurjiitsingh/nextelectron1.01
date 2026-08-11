"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function readCustomerAccountData({
  tx,
  wholeSaleCutomerId,
}: {
  tx: FirebaseFirestore.Transaction;
  wholeSaleCutomerId?: string;
}) {
  let currentBalance = 0;
  let currentCreditBalance = 0;

  if (wholeSaleCutomerId) {
    const accountRef = adminDb
      .collection("customerAccounts")
      .doc(wholeSaleCutomerId);

    const accountSnap = await tx.get(accountRef);

    const data = accountSnap.data() || {};

    currentBalance = Number(data.balance || 0);
    currentCreditBalance = Number(
      data.creditBalance || 0
    );
  }

  return {
    currentBalance,
    currentCreditBalance,
  };
}