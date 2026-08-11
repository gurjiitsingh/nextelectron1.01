import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type ApplySupplierTransactionParams = {
  supplierId?: string;
  supplierName?: string;

  type: "PURCHASE" | "SUPPLIER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  quantity?: number;
conversionFactor?:number;
purchaseUnit?: string;

  currentBalance: number;
  creditAmount?: number;
currentCreditBalance?: number;

  paymentMethod?: PaymentMethodType;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;
  source?: "SYSTEM" | "ADMIN" | "WEB_ADMIN";
};

export async function applySupplierTransaction(
  tx: FirebaseFirestore.Transaction,
  {
    supplierId,
    supplierName,

    type,

    totalAmount,
    paidAmount,
    dueAmount,
    currentBalance,

creditAmount: newCreditAmount = 0,
currentCreditBalance = 0,

paymentMethod,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",
    source = "SYSTEM",
  }: ApplySupplierTransactionParams
) {

  // console.log("in supplier transaction-------------------  type, totalAmount, paidAmount, dueAmount,currentBalance,paymentMethod,", type,

    // totalAmount,
    // paidAmount,
    // dueAmount,
    // currentBalance,
    // paymentMethod,)

  if (!supplierId) return;

  // ==========================================
  // SUPPLIER LEDGER
  // ==========================================

const total = Number(totalAmount || 0);
const paid = Number(paidAmount || 0);
const due = Number(dueAmount || 0);

const credit =
  Number(newCreditAmount || 0) +
  currentCreditBalance;

  let balance = currentBalance;
  let balanceChange = 0;
  let returnAmount = 0;
  let creditAmount = 0;
  let creditUsed = 0;

 if (type === "PURCHASE") {
  let effectiveDue = due;

  if (credit > 0) {
    if (credit >= due) {
      creditUsed = due;

      creditAmount =
        credit - due;

      effectiveDue = 0;
    } else {
      creditUsed = credit;

      creditAmount = 0;

      effectiveDue =
        due - credit;
    }
  }

  balanceChange =
    effectiveDue;

  balance =
    currentBalance +
    effectiveDue;
}

  else if (type === "PAYMENT") {
    balanceChange = -paid;

    balance = Math.max(
      currentBalance - paid,
      0
    );
  }

  else if (
    type === "SUPPLIER_RETURN"
  ) {
    returnAmount = total;

    if (returnAmount <= currentBalance) {
      creditUsed = returnAmount;

      balanceChange =
        -returnAmount;

      balance =
        currentBalance -
        returnAmount;

      creditAmount = 0;
    } else {
      creditUsed =
        currentBalance;

      balanceChange =
        -returnAmount;

      balance = 0;

      creditAmount =
        returnAmount -
        currentBalance;
    }
  }

  // ==========================================
  // CALCULATE RUNNING BALANCE
  // ==========================================




  const ledgerRef = adminDb
    .collection("supplierLedger")
    .doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,

    supplierId,
    supplierName: supplierName || "",

    type,

    totalAmount: total,

    returnAmount,

    creditAmount,
    creditUsed,

    paidAmount: paid,
    dueAmount: due,
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

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    transactionId: ledgerRef.id,
    balance,
  };
}