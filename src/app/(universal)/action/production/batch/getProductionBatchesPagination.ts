"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

const PAGE_SIZE = 15;

type Props = {
  lastDocId?: string;
  firstDocId?: string;
  direction?: "next" | "prev";
  date?: string; // YYYY-MM-DD
};

export async function getProductionBatchesPagination({
  lastDocId,
  firstDocId,
  direction = "next",
  date,
}: Props) {
  try {
    let query: FirebaseFirestore.Query =
      adminDb
        .collection("production_batches")
        .orderBy("createdAt", "desc");

    // ============================
    // DATE FILTER
    // ============================

    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      query = query
        .where(
          "createdAt",
          ">=",
          admin.firestore.Timestamp.fromDate(start)
        )
        .where(
          "createdAt",
          "<",
          admin.firestore.Timestamp.fromDate(end)
        );
    }

    // ============================
    // NEXT PAGE
    // ============================

    if (direction === "next" && lastDocId) {
      const lastSnap = await adminDb
        .collection("production_batches")
        .doc(lastDocId)
        .get();

      if (lastSnap.exists) {
        query = query.startAfter(lastSnap);
      }
    }

    // ============================
    // PREVIOUS PAGE
    // ============================

    if (direction === "prev" && firstDocId) {
      const firstSnap = await adminDb
        .collection("production_batches")
        .doc(firstDocId)
        .get();

      if (firstSnap.exists) {
        query = query
          .endBefore(firstSnap)
          .limitToLast(PAGE_SIZE + 1);
      }
    } else {
      query = query.limit(PAGE_SIZE + 1);
    }

    const snapshot = await query.get();

    let docs = snapshot.docs;

    let hasNext = false;

    if (docs.length > PAGE_SIZE) {
      hasNext = true;
      docs = docs.slice(0, PAGE_SIZE);
    }

    const batches = docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        departmentId:
          data.departmentId || "",

        departmentName:
          data.departmentName || "",
productName: data.productName || "",
          outputQty: data.outputQty || 0,
          productUnit: data.productUnit || "kg",

        createdAt:
          data.createdAt?.toMillis?.() || 0,

        note: data.note || "",

        isClosed:
          data.isClosed || false,
      };
    });

    return {
      success: true,

      data: batches,

      hasNext,

      hasPrev:
        !!firstDocId || !!lastDocId,

      firstDocId:
        docs.length > 0
          ? docs[0].id
          : null,

      lastDocId:
        docs.length > 0
          ? docs[docs.length - 1].id
          : null,
    };
  } catch (error: any) {
    console.error(
      "getProductionBatchesPagination:",
      error
    );

   return {
  success: false,
  message: error.message || "Failed",
  data: [],
  hasNext: false,
  hasPrev: false,
  firstDocId: "",
  lastDocId: "",
};
  }
}