import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type ApplyCustomerTransactionParams = {
  customerId?: string;
  customerName?: string;

  type: "SALE" | "CUSTOMER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  currentBalance: number;
  paymentMethod?: PaymentMethod;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;
  source?: "SYSTEM" | "ADMIN" | "POS";
};

export async function applyCustomerTransaction_old(
  tx: FirebaseFirestore.Transaction,
  {
    customerId,
    customerName,

    type,

    totalAmount,
    paidAmount,
    dueAmount,
    currentBalance,
    paymentMethod,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",
    source = "SYSTEM",
  }: ApplyCustomerTransactionParams
) {
  if (!customerId) return;

console.log("currentBalance-----------", currentBalance)
console.log("totalAmount-----------",  totalAmount)
console.log("paidAmount-----------", paidAmount)
console.log("dueAmount-----------", dueAmount)
console.log("type-----------", type)
  // ==========================================
  // CALCULATE NEW BALANCE
  // ==========================================

  let balance = currentBalance;

  if (type === "SALE") {
    balance += dueAmount;
  }

  if (type === "CUSTOMER_RETURN") {
    balance -= totalAmount;
  }

  if (type === "PAYMENT") {
    balance -= paidAmount;
  }

  // ==========================================
  // CUSTOMER LEDGER
  // ==========================================


  const ledgerRef = adminDb.collection("customerLedger").doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,
    customerId,
    customerName: customerName || "",
    type,
    totalAmount,
    paidAmount,
    dueAmount,
    balance,
    paymentMethod: paymentMethod || null,
    referenceType,
    referenceId,
    note,
    createdBy,
    source,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    transactionId: ledgerRef.id,
  };
}