import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type UpdateCustomerAccountParams = {
  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  type: "SALE" | "CUSTOMER_RETURN" | "PAYMENT";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  creditAmount?: number;

  currentBalance: number;
  currentCreditBalance: number;

  paymentMethod?: PaymentMethodType;
};

export async function updateCustomerAccountBulkSale(
  tx: FirebaseFirestore.Transaction,
  {
    wholeSaleCutomerId,
    wholeSaleCutomerName,
    type,
    totalAmount,
    paidAmount,
    dueAmount = 0,
    creditAmount = 0,
    currentBalance,
    currentCreditBalance,
    paymentMethod,
  }: UpdateCustomerAccountParams
): Promise<{
  balance: number;
  creditBalance: number;
}> {
  // =========================
  // CUSTOMER NOT PROVIDED
  // =========================
  if (!wholeSaleCutomerId) {
    return {
      balance: currentBalance,
      creditBalance: currentCreditBalance,
    };
  }

  console.log(
    "in update customer account-------------------",
    {
      wholeSaleCutomerId,
      wholeSaleCutomerName,
      type,
      totalAmount,
      paidAmount,
      dueAmount,
      creditAmount,
      currentBalance,
      currentCreditBalance,
      paymentMethod,
    }
  );

  let balance = currentBalance;
  let creditBalance = currentCreditBalance;

  let credit = 0;
  let debit = 0;

  let sale = 0;
  let returnAmount = 0;
  let paid = 0;

  let cash = 0;
  let upi = 0;
  let card = 0;

  // =========================
  // SALE
  // =========================

  if (type === "SALE") {
    sale = totalAmount;
    paid = paidAmount;

    let remainingDue = dueAmount;

    // Apply available credit first
    if (creditBalance > 0) {
      const usedCredit = Math.min(
        creditBalance,
        remainingDue
      );

      remainingDue -= usedCredit;
      creditBalance -= usedCredit;
    }

    debit = remainingDue;
    balance += remainingDue;

    if (paid > 0) {
      if (paymentMethod === "CASH") {
        cash = paid;
      } else if (paymentMethod === "UPI") {
        upi = paid;
      } else if (paymentMethod === "CARD") {
        card = paid;
      }
    }
  }

  // =========================
  // CUSTOMER RETURN
  // =========================

  else if (type === "CUSTOMER_RETURN") {
    const returnValue = Number(creditAmount || 0);

    returnAmount = returnValue;

    if (returnValue <= balance) {
      credit = returnValue;
      balance -= returnValue;
    } else {
      const extra = returnValue - balance;

      credit = balance;
      balance = 0;

      // Extra becomes customer credit
      creditBalance += extra;
    }
  }

  // =========================
  // PAYMENT
  // =========================

  else if (type === "PAYMENT") {
    credit = paidAmount;
    paid = paidAmount;

    balance -= paidAmount;

    if (paymentMethod === "CASH") {
      cash = paidAmount;
    } else if (paymentMethod === "UPI") {
      upi = paidAmount;
    } else if (paymentMethod === "CARD") {
      card = paidAmount;
    }
  }

  const accountRef = adminDb
    .collection("customerAccounts")
    .doc(wholeSaleCutomerId);

  // =========================
  // UPDATE ACCOUNT
  // =========================

  tx.set(
    accountRef,
    {
      wholeSaleCutomerId,
      wholeSaleCutomerName,

      totalCredit:
        admin.firestore.FieldValue.increment(
          credit
        ),

      totalDebit:
        admin.firestore.FieldValue.increment(
          debit
        ),

      totalSales:
        admin.firestore.FieldValue.increment(
          sale
        ),

      totalReturn:
        admin.firestore.FieldValue.increment(
          returnAmount
        ),

      totalPaid:
        admin.firestore.FieldValue.increment(
          paid
        ),

      cashPaid:
        admin.firestore.FieldValue.increment(
          cash
        ),

      upiPaid:
        admin.firestore.FieldValue.increment(
          upi
        ),

      cardPaid:
        admin.firestore.FieldValue.increment(
          card
        ),

      balance,
      creditBalance,

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  // =========================
  // RETURN UPDATED BALANCES
  // =========================

  return {
    balance,
    creditBalance,
  };
}