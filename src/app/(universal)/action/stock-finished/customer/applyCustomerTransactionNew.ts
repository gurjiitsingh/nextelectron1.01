import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type ApplyCustomerTransactionParams = {
  customerId?: string;
  customerName?: string;

  type:
    | "SALE"
    | "CUSTOMER_RETURN"
    | "PAYMENT";

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

  source?:
    | "SYSTEM"
    | "ADMIN"
    | "POS";
};


export async function applyCustomerTransactionNew(
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

  if (!customerId) {
    return;
  }


  // =================================================
  // NORMALIZE VALUES
  // =================================================

  const total =
    Number(totalAmount || 0);

  const paid =
    Number(paidAmount || 0);

  const due =
    Number(dueAmount || 0);

  const existingCredit =
    Number(currentCreditBalance || 0);

  const additionalCredit =
    Number(creditAmount || 0);


  // =================================================
  // DEFAULTS
  // =================================================

  let balance =
    Number(currentBalance || 0);

  let balanceChange = 0;

  let creditBalance =
    existingCredit;

  let creditUsed = 0;


  // =================================================
  // SALE
  // =================================================

  if (type === "SALE") {

    /*
     * Sale increases customer receivable.
     *
     * Example:
     *
     * Old balance = 5,000
     * Sale        = 10,000
     * Paid        = 4,000
     * Due         = 6,000
     *
     * New balance = 11,000
     */

    balanceChange =
      due;

    balance =
      currentBalance +
      due;


    /*
     * Existing customer credit is NOT
     * automatically consumed here.
     *
     * If later you want automatic
     * advance-credit adjustment,
     * handle it explicitly.
     */
  }


  // =================================================
  // PAYMENT
  // =================================================

  else if (type === "PAYMENT") {

    /*
     * Customer pays existing balance.
     *
     * Old balance = 10,000
     * Payment     = 4,000
     *
     * New balance = 6,000
     */

    balanceChange =
      -paid;

    balance =
      Math.max(
        currentBalance - paid,
        0
      );
  }


  // =================================================
  // CUSTOMER RETURN
  // =================================================

  else if (
    type === "CUSTOMER_RETURN"
  ) {

    /*
     * Customer returns goods.
     *
     * Return reduces what customer owes.
     */

    const returnValue =
      Number(
        returnProductAmount || 0
      );

    balanceChange =
      -returnValue;

    balance =
      Math.max(
        currentBalance -
          returnValue,
        0
      );
  }


  // =================================================
  // ADD NEW CUSTOMER CREDIT
  // =================================================

  if (additionalCredit > 0) {

    creditBalance =
      existingCredit +
      additionalCredit;
  }


  // =================================================
  // SAVE CUSTOMER LEDGER
  // =================================================

  const ledgerRef =
    adminDb
      .collection("customerLedger")
      .doc();


  tx.set(ledgerRef, {

    transactionId:
      ledgerRef.id,

    customerId,

    customerName:
      customerName || "",

    type,

    totalAmount:
      total,

    returnAmount:
      Number(
        returnProductAmount || 0
      ),

    paidAmount:
      paid,

    dueAmount:
      due,

    creditAmount:
      creditBalance,

    creditUsed,

    previousBalance:
      currentBalance,

    balanceChange,

    balance,

    currentCreditBalance:
      existingCredit,

    newCreditBalance:
      creditBalance,

    paymentMethod:
      paymentMethod || null,

    referenceType,

    referenceId,

    note,

    createdBy,

    source,

    status:
      "ACTIVE",

    createdAt:
      admin.firestore.FieldValue
        .serverTimestamp(),
  });


  return {

    transactionId:
      ledgerRef.id,

    balance,

    creditBalance,

  };
}