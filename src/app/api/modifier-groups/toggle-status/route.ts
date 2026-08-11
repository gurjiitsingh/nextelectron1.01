// /api/modifier-groups/toggle-status/route.ts

import { adminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();

  try {
    await adminDb.collection("modifierGroups").doc(id).update({
      status,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}