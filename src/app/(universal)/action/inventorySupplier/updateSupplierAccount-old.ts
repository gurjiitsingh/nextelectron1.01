import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type PaymentMethod = "CASH" | "UPI" | "CARD";
type UpdateSupplierAccountParams = {
  supplierId?: string;
  type: string;
  totalAmount: number;
  paidAmount: number;   // ✅ ADD
  dueAmount: number;    // ✅ ADD
    paymentMethod?: PaymentMethod;
};

export async function updateSupplierAccount_old({
  supplierId,
  type,
  totalAmount,
  paidAmount,
  dueAmount,
  paymentMethod,
}: UpdateSupplierAccountParams) {

  let cash = 0;
let upi = 0;
let card = 0;

if (type === "PURCHASE") {
  if (paymentMethod === "CASH") cash = paidAmount;
  if (paymentMethod === "UPI") upi = paidAmount;
  if (paymentMethod === "CARD") card = paidAmount;
}
  try {
    if (!supplierId) return;

    const accountRef = adminDb
      .collection("supplierAccounts")
      .doc(supplierId);

    let credit = 0; // increases balance (you owe supplier)
    let debit = 0;  // decreases balance

    let purchase = 0;
    let returnAmount = 0;
    let paid = 0;

    // ===============================
    // LOGIC
    // ===============================

    if (type === "PURCHASE") {
      purchase = totalAmount;
      paid = paidAmount;

      // only unpaid part increases balance
      credit = dueAmount;
    }

    if (type === "SUPPLIER_RETURN") {
      debit = totalAmount;
      returnAmount = totalAmount;
    }

    if (type === "PAYMENT") {
  debit = paidAmount; // reduce balance
  paid = paidAmount;
}

    // ===============================
    // UPDATE (ATOMIC)
    // ===============================

   await accountRef.set(
  {
    supplierId,

    totalCredit: admin.firestore.FieldValue.increment(credit),
    totalDebit: admin.firestore.FieldValue.increment(debit),

    totalPurchase: admin.firestore.FieldValue.increment(purchase),
    totalReturn: admin.firestore.FieldValue.increment(returnAmount),

    totalPaid: admin.firestore.FieldValue.increment(paid),

    // ✅ ADD THESE
    cashPaid: admin.firestore.FieldValue.increment(cash),
    upiPaid: admin.firestore.FieldValue.increment(upi),
    cardPaid: admin.firestore.FieldValue.increment(card),

    balance: admin.firestore.FieldValue.increment(credit - debit),

    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);
  } catch (error) {
    console.error(
      "❌ updateSupplierAccount failed:",
      error
    );
  }
}