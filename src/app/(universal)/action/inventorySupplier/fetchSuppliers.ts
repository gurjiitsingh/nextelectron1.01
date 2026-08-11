

import { adminDb } from "@/lib/firebaseAdmin";
import { SupplierType } from "@/lib/types/SupplierType";

export async function fetchSuppliers(): Promise<
  SupplierType[]
> {
  const snapshot =
    await adminDb
      .collection("suppliers")
      .orderBy(
        "companyName",
        "asc"
      )
      .get();

  return snapshot.docs.map(
    (doc) => {
      const data =
        doc.data();

      return {
        id: doc.id,
        ...data,

        createdAt:
          data.createdAt
            ? data.createdAt
                .toDate()
                .toISOString()
            : null,

        updatedAt:
          data.updatedAt
            ? data.updatedAt
                .toDate()
                .toISOString()
            : null,
      };
    }
  ) as SupplierType[];
}