// app/api/outlet/route.ts
import { fetchOutletInternal } from "@/app/(universal)/action/outlet/dbOperation";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const outlet = await fetchOutletInternal();
    return NextResponse.json(outlet ?? null);
  } catch (e) {
    return NextResponse.json(null, { status: 500 });
  }
}
