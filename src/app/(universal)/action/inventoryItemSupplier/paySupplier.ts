"use server";

import { addLedgerEntry } from "../ledger/addLedgerEntry";



type PaymentMethod = "CASH" | "UPI" | "CARD";

export async function paySupplier({
  supplierId,
  amount,
  method,
}: {
  supplierId: string;
  amount: number;
  method: PaymentMethod;
}) {
  if (!supplierId || amount <= 0) {
    return { success: false, message: "Invalid payment" };
  }

  // 1. Reduce liability
  await addLedgerEntry({
    account: "SUPPLIER_PAYABLE",
    type: "DEBIT",
    amount,
    supplierId,
    referenceType: "PAYMENT",
  });

  // 2. Reduce cash/bank
  await addLedgerEntry({
    account: method, // CASH / UPI / CARD
    type: "CREDIT",
    amount,
    supplierId,
    referenceType: "PAYMENT",
  });

  return { success: true };
}