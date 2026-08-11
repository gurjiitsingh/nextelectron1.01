import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q =
      searchParams
        .get("q")
        ?.trim()
        .toLowerCase() || "";

    // EMPTY SEARCH
    if (!q) {
      return NextResponse.json([]);
    }

    const snapshot = await adminDb
      .collection("products")
    //   .where("type", "==", "parent")
      .orderBy("name")
      .startAt(q)
      .endAt(q + "\uf8ff")
      .limit(20)
      .get();

    const products = snapshot.docs.map(
      (doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name || "",
          productCat:
            data.productCat || "",
        };
      }
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return NextResponse.json([]);
  }
}