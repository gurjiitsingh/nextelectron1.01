"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { validateRawStock } from "../../inventory/rawInventory/validateRawStock";
import { departmentStockTransaction } from "./departmentStockTransaction";
import { updateDepartmentStockTx } from "./UpdateDepartmentStockTx";
import { getDepartmentStockData } from "./getDepartmentStockData";
import { readRawInventoryData } from "../readRawInventoryData";
import { writeInventoryDataIssueStock } from "../../inventory/rawInventory/writeInventoryDataIssueStock";
import { applyTransactionInventoryIssueStock } from "../../inventory/rawInventory/applyTransactionInventoryIssueStock";
import { getDepartmentStockDataIssueStock } from "./getDepartmentStockDataIssueStock";

export async function issueStockToDepartment(
  input: CreateProductionBatchInputType
) {
  const db = adminDb;
console.log("issueStockToDepartment from form--------------------------",input)
  try {
    if (!input.departmentId) {
      return {
        success: false,
        message: "Department required",
      };
    }

    if (!input.items.length) {
      return {
        success: false,
        message: "Add items",
      };
    }

    const now = new Date();
    const timestamp = Date.now();
    const transferId = `DEPT-ISSUE-${timestamp}`;

    await db.runTransaction(async (tx) => {
      // ==========================================
      // 1. PREPARE RAW REQUEST
      // ==========================================

      console.log("item-----------------------------------", input)

      const itemsInConsumptionUnit = input.items.map((item) => ({
        ...item,
        quantity: item.quantity * (item.conversionFactor || 1),
      }));



      const rawRequest = itemsInConsumptionUnit.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        averageCost: item.averageCost,
        purchaseUnit: item.purchaseUnit,
        conversionFactor: item.conversionFactor || 1,
        consumptionUnit: item.consumptionUnit
      }));
      //console.log("purchaseUnitCostInv----------------------", rawRequest)
      // ==========================================
      // 2. READ RAW INVENTORY
      // ==========================================


      const rawUpdates =
        await readRawInventoryData(
          tx,
          "OUT",
          rawRequest,

        );


      // ==========================================
      // 3. READ DEPARTMENT STOCK
      // ==========================================

      const departmentRecord =
        await getDepartmentStockDataIssueStock(
          tx,
          input.departmentId,
          "IN",
          itemsInConsumptionUnit
        );
      // console.log("Dpt stock issue -----------------------",departmentRecord)
      // ==========================================
      // 4. VALIDATE RAW STOCK
      // ==========================================
// IMPLIMENTED AT EARLY STAGE
      //validateRawStock(rawUpdates);

      // ==========================================
      // 5. WRITE DEPARTMENT STOCK
      // ==========================================

      for (const update of departmentRecord) {
        await updateDepartmentStockTx({
          transaction: tx,
          update,
        });
      }

      // ==========================================
      // 6. WRITE DEPARTMENT LEDGER
      // ==========================================

      for (const item of itemsInConsumptionUnit) {
        await departmentStockTransaction({
          transaction: tx,

          transferId,

          departmentId: input.departmentId,
          departmentName:
            input.departmentName,

          inventoryItemId:
            item.inventoryItemId,
          inventoryItemName:
            item.inventoryItemName,

          quantity: item.quantity,

          purchaseUnit:
            item.purchaseUnit,
          consumptionUnit:
            item.consumptionUnit,
          conversionFactor:
            item.conversionFactor,

          averageCost:
            item.averageCost,
          costPerUnit:
            item.costPerUnit!,
          totalCost:
            item.quantity *
            item.costPerUnit!,
          type: "ISSUE_TO_DEPARTMENT",
          direction: "IN",
          referenceType: "ISSUE_TO_DEPARTMENT",

          createdAt: now,
        });
      }

      // ==========================================
      // 7. WRITE INVENTORY STOCK
      // ==========================================


      await writeInventoryDataIssueStock(
        tx,
        rawUpdates,
        transferId,
        "OUT"
      );


      // ==========================================
      // 7. WRITE INVENTORY LEDGER 
      // ==========================================
      //UPDATE: stockLedgerInventory
      await applyTransactionInventoryIssueStock(
        tx,
        rawUpdates,
        transferId,
        "STROE TO DPT",
        "OUT",
        input.departmentId,
        input.departmentName,
      );



    });

    return {
      success: true,
      message:
        "Stock issued to department successfully.",
    };
  } catch (error: any) {
    console.error(
      "❌ issueStockToDepartment:",
      error
    );

    return {
      success: false,
      message:
        error.message || "Failed",
    };
  }
}