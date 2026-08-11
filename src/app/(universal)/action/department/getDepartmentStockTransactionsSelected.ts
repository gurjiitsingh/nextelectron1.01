import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

interface Props {
  type?: string;
  departmentId?: string;
  search?: string;
  date?: string;
}

export async function getDepartmentStockTransactionsSelected({
  type = "ISSUE_TO_DEPARTMENT",
  departmentId = "ALL",
  search = "",
  date,
}: Props) {
  try {
    const selectedDate = date
      ? new Date(`${date}T00:00:00`)
      : new Date();

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    let query: FirebaseFirestore.Query = adminDb
      .collection("departmentStockTransactions")
      .where(
        "createdAt",
        ">=",
        Timestamp.fromDate(startOfDay)
      )
      .where(
        "createdAt",
        "<=",
        Timestamp.fromDate(endOfDay)
      );

    if (type !== "ALL") {
      query = query.where("type", "==", type);
    }

    if (departmentId !== "ALL") {
      query = query.where(
        "departmentId",
        "==",
        departmentId
      );
    }

    const snapshot = await query
      .orderBy("createdAt", "desc")
      .get();

    let transactions = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() ??
          null,
      };
    });

    // Free-text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();

      transactions = transactions.filter((item: any) =>
        [
          item.departmentName,
          item.inventoryItemName,
          item.createdBy,
          item.type,
          item.referenceType,
          item.remarks,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(q)
          )
      );
    }

    return {
      success: true,
      data: transactions,
    };
  } catch (error: any) {
    console.error(
      "❌ getDepartmentStockTransactionsSelected:",
      error
    );

    return {
      success: false,
      data: [],
      message:
        error.message ??
        "Failed to load department stock transactions.",
    };
  }
}