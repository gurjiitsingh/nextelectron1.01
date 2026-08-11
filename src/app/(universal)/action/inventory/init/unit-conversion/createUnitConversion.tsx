"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

type CreateUnitConversionInput = {
  purchaseUnit: string;
  consumptionUnit: string;
  factor: number;
};

export async function createUnitConversion({
  purchaseUnit,
  consumptionUnit,
  factor,
}: CreateUnitConversionInput) {
  try {
    purchaseUnit = purchaseUnit.trim().toLowerCase();
    consumptionUnit =
      consumptionUnit.trim().toLowerCase();

    if (
      !purchaseUnit ||
      !consumptionUnit ||
      factor <= 0
    ) {
      return {
        success: false,
        message: "Invalid data",
      };
    }

    const existing = await adminDb
      .collection("inventoryUnitConversions")
      .where(
        "purchaseUnit",
        "==",
        purchaseUnit
      )
      .where(
        "consumptionUnit",
        "==",
        consumptionUnit
      )
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        message:
          "Conversion already exists",
      };
    }

    await adminDb
      .collection(
        "inventoryUnitConversions"
      )
      .add({
        purchaseUnit,
        consumptionUnit,
        factor,

        isActive: true,
        system: false,

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message:
        "Unit conversion created successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "Failed to create conversion",
    };
  }
}