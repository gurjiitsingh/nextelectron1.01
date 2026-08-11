"use server";


//RED CUSOTMER DATA    readCustomerAccountData

import { adminDb } from "@/lib/firebaseAdmin";
import { getStockLocation } from "../../getStockLocationTx";
import { updateStockLocation } from "../../updateStockLocation";
import { addStockLocation } from "../../addStockLocationTx";
import { addStockMovement } from "../../addStockMovement";

import { readStockLocationsForItems } from "../../redDataForSale/readStockLocationsForItems";
import { readCustomerAccountData } from "../../redDataForSale/readCustomerAccountData";
import { addItemSaleTruck } from "../../recordTruckSaleLedger";
import { readFinishedProductData } from "../../redDataForSale/readFinishedProductData";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";
import { applyFinishedTransactions } from "../applyFinishedTransactions";
import { writeProductStockBulkTransactions } from "./writeProductStockBulkTransactions";
import { updateCustomerAccount } from "../../../stock-finished/inventorySupplier/updateCustomerAccount";
import { applyCustomerTransaction } from "../../../stock-finished/customer/applyCustomerTransaction";
import { updateCustomerAccountBulkSale } from "./updateCustomerAccountBulkSale";



type deliveryTruckSaleProps = {
  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus: "PAID" | "PARTIAL" | "CREDIT";
  paymentMethod?: PaymentMethodType;

  paidAmount: number;
  dueAmount: number;

  remarks?: string;
  createdBy?: string;

  items: {
    productId: string;
    quantity: number;
    wholesalePrice: number;
  }[];
};

export async function bulkSale({
  vehicleId,
  vehicleName,
  locationCode,
  responsiblePerson,

  wholeSaleCutomerId,
  wholeSaleCutomerName,

  totalAmount,

  paymentStatus,
  paymentMethod,
  paidAmount,
  dueAmount,

  remarks,
  createdBy,
  items,

}: deliveryTruckSaleProps) {

  console.log("===== Bulk Sale =====");

  console.log({
    vehicleId,
    vehicleName,
    locationCode,
    responsiblePerson,

    wholeSaleCutomerId,
    wholeSaleCutomerName,

    totalAmount,

    paymentStatus,
    paymentMethod,
    paidAmount,
    dueAmount,

    remarks,
    createdBy,

    items,
  });

  console.log("==================================");

  if (!wholeSaleCutomerId) {
    return {
      success: false,
      message: "Customer is required.",
    };
  }
  try {
    if (!vehicleId) {
      return {
        success: false,
        message: "Vehicle is required.",
      };
    }

    if (!items.length) {
      return {
        success: false,
        message: "No products selected.",
      };
    }

    if (totalAmount <= 0) {
      return {
        success: false,
        message: "Invalid total amount.",
      };
    }


    if (paidAmount < 0 || dueAmount < 0) {
      return {
        success: false,
        message: "Invalid payment amount.",
      };
    }


    if (
      Math.round((paidAmount + dueAmount) * 100) !==
      Math.round(totalAmount * 100)
    ) {
      return {
        success: false,
        message:
          "Paid amount and due amount do not match total amount.",
      };
    }




    await adminDb.runTransaction(async (tx) => {





      // =========================
      //READ AND VALIDATE
      // =========================
      const saleProducts = [];

      for (const item of items) {
        const product = await readFinishedProductData({
          tx,
          productId: item.productId,
        });

        if (product.beforeStock < item.quantity) {
          throw new Error(
            `${product.productName} has insufficient stock.`
          );
        }

        saleProducts.push({
          item,
          product,
        });
      }


      // =========================
      //READ CUSTOMER DATA
      // =========================

      const {
        currentBalance,
        currentCreditBalance,
      } = await readCustomerAccountData({
        tx,
        wholeSaleCutomerId,
      });



      let runningBalance = currentBalance;
      let runningCreditBalance = currentCreditBalance;

      // =========================
      // WRITE
      // =========================

      

 // ==========================================
// WRITE PRODUCT STOCK TRANSACTIONS
// ==========================================

let referenceId = "";
let referenceType = "SALE";

for (const row of saleProducts) {
  const lineTotal =
    row.item.quantity * row.item.wholesalePrice;

  const finishedResult =
    await writeProductStockBulkTransactions(tx, {
      productId: row.product.id,
      finishedProduct: row.product,

      type: "SALE",
      direction: "OUT",

      quantity: row.item.quantity,
      transactionUnit: "kg",

      unitPrice: row.item.wholesalePrice,

      customerId: wholeSaleCutomerId,
      customerName: wholeSaleCutomerName,

      totalAmount: lineTotal,

      paymentStatus,
      paymentMethod,

      referenceType: "SALE",
      referenceId: "",

      note: remarks,
      createdBy: createdBy || "admin",
      source: "ADMIN",
    });

  // Save reference from first transaction (or last if you prefer)
  if (!referenceId) {
    referenceId = finishedResult.transactionId;
    referenceType = "SALE";
  }
}

// ==========================================
// CUSTOMER LEDGER (ONE ENTRY FOR WHOLE SALE)
// ==========================================

await applyCustomerTransaction(tx, {
  customerId: wholeSaleCutomerId,
  customerName: wholeSaleCutomerName,

  type: "SALE",

  totalAmount,
  returnProductAmount: 0,
  paidAmount,
  dueAmount,

  currentBalance,
  creditAmount: 0,
  currentCreditBalance,

  paymentMethod,

  referenceId,
  referenceType,

  note: remarks,

  createdBy: createdBy || "admin",
  source: "ADMIN",
});



   // ==========================================
        // CUSTOMER ACCOUNT
        // ==========================================

 
        const account = await updateCustomerAccountBulkSale(tx, {
          wholeSaleCutomerId,
          wholeSaleCutomerName,
          type: "SALE",

          totalAmount,
          paidAmount,
          dueAmount,

          currentBalance: runningBalance,
          currentCreditBalance: runningCreditBalance,

          paymentMethod,
        });

        runningBalance = account.balance;
        runningCreditBalance = account.creditBalance;



    });
    console.log("data------------", 4)
    return {
      success: true,
      message: "Truck delivery sale recorded successfully.",
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      message: error.message || "Failed to record sale.",
    };
  }
}