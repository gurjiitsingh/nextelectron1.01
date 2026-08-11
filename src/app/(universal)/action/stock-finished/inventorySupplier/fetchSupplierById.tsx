import { adminDb } from "@/lib/firebaseAdmin";
import { SupplierType } from "@/lib/types/SupplierType";



export async function fetchSupplierById(
  id: string
): Promise<SupplierType | null> {
  try {
    const docRef =
      await adminDb
        .collection(
          "wholesaleCutomer"
        )
        .doc(id)
        .get();

    if (
      !docRef.exists
    ) {
      return null;
    }

    const data =
      docRef.data();

    return {
      id: docRef.id,

      ...data,

      createdAt:
        data?.createdAt
          ? data.createdAt.toMillis()
          : null,

      updatedAt:
        data?.updatedAt
          ? data.updatedAt.toMillis()
          : null,
    } as any;
  } catch (error) {
    console.error(
      "❌ Error fetching supplier:",
      error
    );

    return null;
  }
}