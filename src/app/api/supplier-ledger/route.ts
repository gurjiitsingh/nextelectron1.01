import { NextResponse } from "next/server";
import { getSupplierLedgerByLimit } from "@/app/(universal)/action/inventoryItemSupplier/reports/getSupplierLedgerByLimit";
import { getSupplierLedger } from "@/app/(universal)/action/inventoryItemSupplier/reports/getSupplierLedger";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { success, transactions } =
      await getSupplierLedger({
        supplierId: body.supplierId,
        fromDate: body.fromDate,
        toDate: body.toDate,
      });

    return NextResponse.json({
      success,
      transactions,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        transactions: [],
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}