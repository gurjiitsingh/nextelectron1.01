import { getInventoryTransactionsSelected } from "@/app/(universal)/action/inventory/getInventoryTransactionsSelected";
import { NextRequest, NextResponse } from "next/server";
 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date") ?? undefined;
    const type = searchParams.get("type") ?? "PURCHASE";

    const result = await getInventoryTransactionsSelected({
      date,
      type,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Inventory Transactions API Error:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        message: "Failed to load inventory transactions",
      },
      { status: 500 }
    );
  }
}