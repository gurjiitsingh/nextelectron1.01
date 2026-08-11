"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType, InventoryUnit, newInventorySchema } from "@/lib/types/InventoryItemType";
import admin from "firebase-admin";


import { revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";
import { addInventoryItemSupplier } from "../inventoryItemSupplier/addInventoryItemSupplier";

export async function updateInventoryItem(
  id: string,
  formData: FormData
) {
  

  try {
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

    const purchaseMappings = JSON.parse(
  formData.get("purchaseMappings") as string
);

    // const conversionFactor =
    //   Number(
    //     formData.get("conversionFactor")
    //   ) || 1;

    // let currentStock =
    //   Number(
    //     formData.get("currentStock")
    //   ) || 0;

    const minStock =
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
    // }

    // VALIDATION
    const receivedData = {
      name,
      sku: cleanedSku,
      barcode: cleanedBarcode,

     // purchaseUnit,
      consumptionUnit,
      purchaseMappings,

     // currentStock,
      minStock,

      costPrice,
      sellingPrice,

      categoryId,
      supplierIds,

      isActive,
    };
 
    const result =
      newInventorySchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach(
        (issue) => {
          zodErrors[
            issue.path[0] as string
          ] = issue.message;
        }
      );

      return {
        errors: zodErrors,
      };
    }

    const normalizedName =
      name.toLowerCase();

    // DUPLICATE NAME CHECK
    const nameCheck =
      await adminDb
        .collection("inventoryItems")
        .where(
          "nameLower",
          "==",
          normalizedName
        )
        .get();

    const duplicateName =
      nameCheck.docs.find(
        (doc) => doc.id !== id
      );

    if (duplicateName) {
      return {
        errors: {
          name:
            "Inventory item already exists",
        },
      };
    }

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
          .get();

      const duplicateSku =
        skuCheck.docs.find(
          (doc) => doc.id !== id
        );

      if (duplicateSku) {
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
          .get();

      const duplicateBarcode =
        barcodeCheck.docs.find(
          (doc) => doc.id !== id
        );

      if (duplicateBarcode) {
        return {
          errors: {
            barcode:
              "Barcode already exists",
          },
        };
      }
    }

   const data = {
  name,
  nameLower: normalizedName,

  sku: cleanedSku,
  barcode: cleanedBarcode,

  //purchaseUnit,
  consumptionUnit,
  //conversionFactor,
purchaseMappings,
  //currentStock,
  minStock,

  // costPrice,
  // sellingPrice,

  categoryId,

  // ✅ SAVE ARRAY
  supplierIds,

  isActive,

  updatedAt:
    admin.firestore.FieldValue.serverTimestamp(),
};
 

    await adminDb
      .collection("inventoryItems")
      .doc(id)
      .update(data);

      // ==========================
// UPDATE SUPPLIER MAPPINGS
// ==========================

const existingMappings =
  await adminDb
    .collection(
      "inventoryItemSuppliers"
    )
    .where(
      "inventoryItemId",
      "==",
      id
    )
    .get();

const batch =
  adminDb.batch();

existingMappings.docs.forEach(
  (doc) => {
    batch.delete(
      doc.ref
    );
  }
);

await batch.commit();

for (const supplierId of supplierIds) {
  const supplierFormData =
    new FormData();

  supplierFormData.append(
    "inventoryItemId",
    id
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

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory/editform"
    );

    return {
      success: true,
      message:
        "Inventory updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ Inventory update failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update inventory",
    };
  }
}