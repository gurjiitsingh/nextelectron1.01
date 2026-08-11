"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";

import { departmentStockTransaction } from "./departmentStockTransaction";


import { validateDepartmentStock } from "./validateDepartmentStock";

import { readRawInventoryData } from "../readRawInventoryData";
import {   applyTransactionInventoryRetrunStock } from "../../inventory/rawInventory/applyTransactionInventoryReturnStock";
import { getDepartmentStockData } from "./getDepartmentStockData";
import { updateDepartmentStockTx } from "./UpdateDepartmentStockTx";
import { readRawInventoryDataReturn } from "../readRawInventoryDataReturn";
import { getDepartmentStockDataReturnStock } from "./getDepartmentStockDataReturnStock";
import { updateDepartmentStockReturnTx } from "./UpdateDepartmentStockReturnTx";
import { writeInventoryDataReturnStock } from "../../inventory/rawInventory/writeInventoryDataReturnStock";

export async function returnStockToMainStore( 
    input: CreateProductionBatchInputType
) {
    const db = adminDb;

   // console.log("input----------------", input)

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
         //  console.log("item---------------", input.items)
        const now = new Date();
        const timestamp = Date.now();
        const transferId = `DEPT-RETURN-${timestamp}`;

        await db.runTransaction(async (tx) => {
            // ==========================================
            // 1. PREPARE RAW REQUEST
            // ==========================================

            const itemsInConsumptionUnit = input.items.map((item) => ({
                ...item,
                quantity: item.quantity * (item.conversionFactor || 1),
            }));

            const formData = input.items.map((item) => ({
                inventoryItemId: item.inventoryItemId,
                inventoryItemName: item.inventoryItemName,
                // Original quantity entered by the user (purchase unit)
                quantityInPurcahseUnit: item.quantity,
                // Quantity converted to consumption unit
                quantity: item.quantity * (item.conversionFactor || 1),
                averageCostDpt: item.averageCost,
                purchaseUnitDpt: item.purchaseUnit,
                purchaseUnitCostDpt: item.averageCost, // change later if needed
                conversionFactorDpt: item.conversionFactor || 1,
                consumptionUnitDpt: item. consumptionUnit,
            }));

            //   console.log("rawRequest---------------------", rawRequest) 

            // ==========================================
            // 2. READ RAW INVENTORY
            // ==========================================

            const rawUpdates =
                await readRawInventoryDataReturn(
                    tx,
                    "IN",
                    formData,

                );

            // ==========================================
            // 3. READ DEPARTMENT STOCK
            // ==========================================

            const departmentRecord =
                await getDepartmentStockDataReturnStock(
                    tx,
                    input.departmentId,
                    "OUT",
                    formData,//item to formdata
                );
            //console.log("Dpt stock returned -----------------------",departmentRecord)
            // ==========================================
            // 4. VALIDATE RAW STOCK
            // ==========================================

            validateDepartmentStock(departmentRecord);

            // ==========================================
            // 5. WRITE DEPARTMENT STOCK
            // ==========================================

            for (const dpRecord of departmentRecord) {
                await updateDepartmentStockReturnTx({
                    transaction: tx,
                    dpRecord,

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
                        item.costPerUnit,
                    totalCost:
                        item.quantity *
                        item.costPerUnit,


                    type: "RETURN_TO_MAIN_STORE",
                    direction: "OUT",
                    referenceType: "RETURN_TO_MAIN_STORE",

                    createdAt: now,
                });
            }

            // ==========================================
            // 7. WRITE INVENTORY STOCK
            // ==========================================


            await writeInventoryDataReturnStock(
                tx,
                rawUpdates,
                transferId,
                "IN"
            );


            // ==========================================
            // 7. WRITE INVENTORY LEDGER 
            // ==========================================
            //UPDATE: stockLedgerInventory
            await applyTransactionInventoryRetrunStock(
                tx,
                rawUpdates,
                transferId,
                "DPT RETURN",
                "IN"
            );



        });

        return {
            success: true,
            message: "Stock returned to main store successfully."
        };
    } catch (error: any) {
        console.error("❌ returnStockToMainStore:", error);
        return {
            success: false,
            message:
                error.message || "Failed",
        };
    }
}