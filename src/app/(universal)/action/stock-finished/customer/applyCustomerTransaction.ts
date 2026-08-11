import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";



type ApplyCustomerTransactionParams = {
  customerId?: string;
  customerName?: string;

  type: "SALE" | "CUSTOMER_RETURN" | "PAYMENT";

  totalAmount: number;
  returnProductAmount?: number;
  paidAmount: number;
  dueAmount: number;
 creditAmount?: number;
 currentCreditBalance?: number;
  currentBalance: number;

  paymentMethod?: PaymentMethodType;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;
  source?: "SYSTEM" | "ADMIN" | "POS";
};

export async function applyCustomerTransaction(
  tx: FirebaseFirestore.Transaction,
  {
    customerId,
    customerName,
    type,
    totalAmount,
    returnProductAmount = 0,
    paidAmount,
    dueAmount = 0,
    creditAmount = 0,
    currentCreditBalance = 0,
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

 
  // ==========================================
  // LOGIC
  // ==========================================
const total = Number(totalAmount || 0);
const paid = Number(paidAmount || 0);
const due = Number(dueAmount || 0);
const credit = Number(creditAmount || 0) + currentCreditBalance;

 console.log("old/currentCreditBalance----------------",currentCreditBalance)
 console.log("new/credit ----------------",credit)

let balance = currentBalance;
let balanceChange = 0;

let creditRemaining = 0;
let creditUsed = 0;
if (type === "SALE") {
  // ✅ apply existing credit first (IMPORTANT FEATURE)
  let effectiveDue = due;

  // if (credit > 0) {
  //   if (credit >= due) {
  //     creditRemaining =  credit - due;
  //     effectiveDue = 0;
  //   } else {
  //     effectiveDue = due - credit;
  //     creditRemaining = 0;
  //   }
  // }

  if (credit > 0) {
  if (credit >= due) {
    creditUsed = due; // ✅ NEW
    creditRemaining = credit - due;
    effectiveDue = 0;
  } else {
    creditUsed = credit; // ✅ NEW
    effectiveDue = due - credit;
    creditRemaining = 0;
  }
}

  balanceChange = effectiveDue;
  balance = currentBalance + effectiveDue;
}

else if (type === "PAYMENT") {
  balanceChange = -paid;
  balance = currentBalance - paid;
}

else if (type === "CUSTOMER_RETURN") {
  if (credit <= currentBalance) {
    balanceChange = -credit;
    balance = currentBalance - credit;
  } else {
    balanceChange = -credit; // ✅ FIXED
    creditRemaining = credit - currentBalance;
    balance = 0;
  }
}

  // ==========================================
  // SAVE LEDGER
  // ==========================================

  const ledgerRef = adminDb
    .collection("customerLedger")
    .doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,

    customerId,
    customerName: customerName || "",

    type,

    totalAmount: total,
    returnAmount:returnProductAmount,
    paidAmount: paid,

    dueAmount: due,
    creditAmount: creditRemaining, // ✅ only extra stored
creditUsed,
    previousBalance: currentBalance,
    balanceChange,
    balance,

    paymentMethod: paymentMethod || null,

    referenceType,
    referenceId,

    note,
    createdBy,
    source,

    status: "ACTIVE",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    transactionId: ledgerRef.id,
    balance,
  };
}