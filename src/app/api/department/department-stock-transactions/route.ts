import { NextRequest, NextResponse } from "next/server";
import { getDepartmentStockTransactionsSelected } from "@/app/(universal)/action/department/getDepartmentStockTransactionsSelected";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date") ?? undefined;
    const type =
      searchParams.get("type") ?? "ISSUE_TO_DEPARTMENT";
    const departmentId =
      searchParams.get("departmentId") ?? "ALL";
    const search = searchParams.get("search") ?? "";

    const result =
      await getDepartmentStockTransactionsSelected({
        date,
        type,
        departmentId,
        search,
      });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(
      "❌ API department-stock-transactions:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        data: [],
        message:
          error.message ??
          "Failed to load transactions.",
      },
      {
        status: 500,
      }
    );
  }
}