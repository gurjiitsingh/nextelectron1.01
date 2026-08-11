import { NextResponse } from "next/server";
import { getCustomerLedger } from "@/app/(universal)/action/stock-finished/customer/reports/getCustomerLedger";

export async function POST(req: Request) {
  try {
    const { customerId, fromDate, toDate } =
      await req.json();

    const result = await getCustomerLedger({
      customerId,
      fromDate,
      toDate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "❌ Customer Ledger API Error:",
      error
    );

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