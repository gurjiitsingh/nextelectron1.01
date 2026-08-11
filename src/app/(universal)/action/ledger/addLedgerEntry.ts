"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function addLedgerEntry(entry: {
  account: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  supplierId?: string;
  referenceType: string;
  referenceId?: string;
  note?: string;
}) {
  if (!entry.amount || entry.amount <= 0) return;

  await adminDb.collection("ledgerEntries").add({
    ...entry,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}