

import { adminDb } from "@/lib/firebaseAdmin";
import { WholeCustomerType } from "@/lib/types/WholeSaleCustomerType";

export async function fetchCustomer(): Promise<
  WholeCustomerType[]
> {
 
  const snapshot =
    await adminDb
      .collection("wholeSaleCustomer")
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
  ) as WholeCustomerType[];
}