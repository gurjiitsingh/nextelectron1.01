import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";



type UpdateSupplierAccountParams = {
  supplierId: string;
  supplierName: string | undefined;

  type:
    | "PURCHASE"
    | "SUPPLIER_RETURN"
    | "PAYMENT";
 
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  creditAmount?: number;

  currentBalance: number;

  currentCreditBalance: number;

  paymentMethod?: PaymentMethodType;
};

export async function updateSupplierAccount(
  tx: FirebaseFirestore.Transaction,
{
  supplierId,
  supplierName,

  type,

  totalAmount,
  paidAmount,
  dueAmount,

  creditAmount = 0,

  currentBalance,
  currentCreditBalance,

  paymentMethod,
}: UpdateSupplierAccountParams
){
   
  if (!supplierId) return;

  const accountRef = adminDb
    .collection("supplierAccounts")
    .doc(supplierId);

let balance = currentBalance;

let creditBalance =
  currentCreditBalance;

let credit = 0;
let debit = 0;

let purchase = 0;
let returnAmount = 0;
let paid = 0;

let cash = 0;
let upi = 0;
let card = 0;

// =========================
// PURCHASE
// =========================
if (type === "PURCHASE") {
  purchase = totalAmount;

  paid = paidAmount;

  let remainingDue =
    dueAmount;

  // Apply supplier credit first
  if (creditBalance > 0) {
    const usedCredit =
      Math.min(
        creditBalance,
        remainingDue
      );

    remainingDue -=
      usedCredit;

    creditBalance -=
      usedCredit;
  }

  debit = remainingDue;

  balance +=
    remainingDue;

  if (paid > 0) {
    if (
      paymentMethod === "CASH"
    )
      cash = paid;

    else if (
      paymentMethod === "UPI"
    )
      upi = paid;

    else if (
      paymentMethod === "CARD"
    )
      card = paid;
  }
}

// =========================
// SUPPLIER RETURN
// =========================
else if (
  type ===
  "SUPPLIER_RETURN"
) {
  const returnValue =
    Number(
      creditAmount || 0
    );

  returnAmount =
    returnValue;

  if (
    returnValue <= balance
  ) {
    credit = returnValue;

    balance -=
      returnValue;
  } else {
    const extra =
      returnValue -
      balance;

    credit = balance;

    balance = 0;

    creditBalance += extra;
  }
}

// =========================
// PAYMENT
// =========================
else if (
  type === "PAYMENT"
) {
  credit = paidAmount;

  paid = paidAmount;

  balance -= paidAmount;

  if (
    paymentMethod === "CASH"
  )
    cash = paidAmount;

  else if (
    paymentMethod === "UPI"
  )
    upi = paidAmount;

  else if (
    paymentMethod === "CARD"
  )
    card = paidAmount;
}


  tx.set(
    accountRef,
    {
      supplierId,
      supplierName,
      totalCredit:
        admin.firestore.FieldValue.increment(credit),

      totalDebit:
        admin.firestore.FieldValue.increment(debit),

      totalPurchase:
        admin.firestore.FieldValue.increment(purchase),

      totalReturn:
        admin.firestore.FieldValue.increment(returnAmount),

      totalPaid:
        admin.firestore.FieldValue.increment(paid),

      cashPaid:
        admin.firestore.FieldValue.increment(cash),

      upiPaid:
        admin.firestore.FieldValue.increment(upi),

      cardPaid:
        admin.firestore.FieldValue.increment(card),

      // Purchase due increases payable
      // Returns & payments decrease payable
     balance,
creditBalance,


      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}