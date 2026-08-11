"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType, InventoryUnit, newInventorySchema } from "@/lib/types/InventoryItemType";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";
import { addInventoryItemSupplier } from "../inventoryItemSupplier/addInventoryItemSupplier";
import { newInventoryItemAndTransaction } from "./newInvetoryItemTransactions";

export async function addNewInventoryItem(
  formData: FormData
) {
 

  try {
    // FORM VALUES

const purchaseMappings = JSON.parse(
  formData.get("purchaseMappings") as string
);

    const name =
      (formData.get("name") as string)?.trim() ||
      "";

    const cleanedSku =
      (
        formData.get("sku") as string | null
      )?.trim() || "";

    const cleanedBarcode =
      (
        formData.get(
          "barcode"
        ) as string | null
      )?.trim() || "";

    // const purchaseUnit = formData.get(
    //   "purchaseUnit"
    // ) as InventoryUnit;

    const consumptionUnit = formData.get(
      "consumptionUnit"
    ) as InventoryUnit;

    // const conversionFactor =
    //   Number(
    //     formData.get("conversionFactor")
    //   ) || 1;

    let currentStock =
      Number(
        formData.get("currentStock")
      ) || 0;

    let minStock =
      Number(
        formData.get("minStock")
      ) || 0;

    const costPrice =
      Number(
        formData.get("costPrice")
      ) || 0;

    const sellingPrice =
      Number(
        formData.get("sellingPrice")
      ) || 0;

    const categoryId =
      (
        formData.get(
          "categoryId"
        ) as string | null
      ) || "";

   const supplierIds =
  formData.getAll(
    "supplierIds"
  ) as string[];


    const isActive =
      formData.get("isActive") === "true";

    // STORE STOCK IN CONSUMPTION UNIT
    // if (
    //   purchaseUnit !== consumptionUnit &&
    //   conversionFactor > 0
    // ) {
    //   currentStock =
    //     currentStock * conversionFactor;

    //      minStock =
    //     minStock * conversionFactor;
    // }



    // VALIDATION OBJECT
 const receivedData = {
  name,
  sku: cleanedSku,
  barcode: cleanedBarcode,

  //purchaseUnit,
  consumptionUnit,
 // conversionFactor,
purchaseMappings,
  currentStock,
  minStock,

  costPrice,
  sellingPrice,

  categoryId,

  supplierIds,

  isActive,
};
    // ZOD VALIDATION
    const result =
      newInventorySchema.safeParse(
        receivedData
      );

      if (!result.success) {
  console.log(result.error.issues);
}

    // if (!result.success) {
    //   const zodErrors: Record<
    //     string,
    //     string
    //   > = {};

    //   result.error.issues.forEach(
    //     (issue) => {
    //       zodErrors[
    //         issue.path[0] as string
    //       ] = issue.message;
    //     }
    //   );

    //   return {
    //     errors: zodErrors,
    //   };
    // }

    // NORMALIZED NAME
    const normalizedName =
      name.toLowerCase();

    // DUPLICATE SKU CHECK
    if (cleanedSku) {
      const skuCheck =
        await adminDb
          .collection(
            "inventoryItems"
          )
          .where(
            "sku",
            "==",
            cleanedSku
          )
          .limit(1)
          .get();

      if (!skuCheck.empty) {
        return {
          errors: {
            sku: "SKU already exists",
          },
        };
      }
    }

    // DUPLICATE BARCODE CHECK
    if (cleanedBarcode) {
      const barcodeCheck =
        await adminDb
          .collection(
            "inventoryItems"
          )
          .where(
            "barcode",
            "==",
            cleanedBarcode
          )
          .limit(1)
          .get();

      if (!barcodeCheck.empty) {
        return {
          errors: {
            barcode:
              "Barcode already exists",
          },
        };
      }
    }

    // DUPLICATE NAME CHECK
    const existingItem =
      await adminDb
        .collection("inventoryItems")
        .where(
          "nameLower",
          "==",
          normalizedName
        )
        .limit(1)
        .get();

    if (!existingItem.empty) {
      return {
        errors: {
          name:
            "Inventory item already exists",
        },
      };
    }

    // FIRESTORE DATA
    const data = {
  name,
  nameLower: normalizedName,

  sku: cleanedSku,
  barcode: cleanedBarcode,

  consumptionUnit,

  purchaseMappings,

  currentStock,
  minStock,

  costPrice,
  sellingPrice,

  categoryId,

  isActive,

  createdAt:
    admin.firestore.FieldValue.serverTimestamp(),

  updatedAt:
    admin.firestore.FieldValue.serverTimestamp(),
};

 

 // SAVE TO FIRESTORE
const docRef = await adminDb
  .collection("inventoryItems")
  .add(data);

const inventoryItemId = docRef.id;

// =====================================
// CREATE SUPPLIER MAPPINGS
// =====================================

for (const supplierId of supplierIds) {
  const supplierFormData = new FormData();

  supplierFormData.append(
    "inventoryItemId",
    inventoryItemId
  );

  supplierFormData.append(
    "supplierId",
    supplierId
  );

  supplierFormData.append(
    "preferred",
    "false"
  );

  supplierFormData.append(
    "isActive",
    "true"
  );

  await addInventoryItemSupplier(
    supplierFormData
  );
}

// =====================================
// OPENING STOCK TRANSACTION
// =====================================

if (currentStock > 0) {
  await newInventoryItemAndTransaction({
    inventoryItemId,

    type: "OPENING_STOCK",

    direction: "IN",

    // Internal stock (already converted to consumption unit)
    quantity: currentStock,

    // Cost per consumption unit
    unitCost: 0,
      // conversionFactor > 0
      //   ? costPrice / conversionFactor
      //   : costPrice,

    // Original values entered by user
    purchaseQuantity:
      Number(
        formData.get("currentStock")
      ) || 0,

    //purchaseUnit,

    // Cost per purchase unit
    purchaseUnitCost:
      costPrice,

    //conversionFactor,

    paymentStatus: "PAID",

    paidAmount:
      (Number(
        formData.get("currentStock")
      ) || 0) * costPrice,

    note:
      "Opening stock during inventory creation",

    createdBy: "admin",

    referenceId:
      inventoryItemId,

    referenceType: "MANUAL",
  });
}

// REVALIDATE
revalidateTag(
  "inventory-items",
  "max"
);

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/form"
    );

    return {
      success: true,
      message:
        "Inventory item saved successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error(
      "❌ Inventory save failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not save inventory item",
      },
    };
  }
}