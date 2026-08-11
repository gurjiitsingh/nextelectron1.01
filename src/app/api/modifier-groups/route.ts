import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { TnewModifierItemSchema } from "@/lib/types/modifierItemType";

export async function GET() {
  try {
    // 1. Get groups
    const groupSnap = await adminDb.collection("modifierGroups").get();

    const groups = groupSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 2. Get items
    const itemSnap = await adminDb.collection("modifierItems").get();

    type ModifierItem = TnewModifierItemSchema & {
      id: string;
    };

    const items: ModifierItem[] = itemSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ModifierItem
    );

    // 3. Combine
    const result = groups.map((group) => ({
      group,
      items: items.filter((item) => item.groupId === group.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("modifier-groups error:", error);
    return NextResponse.json([], { status: 500 });
  }
}