"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import {   MASTER_UNIT_CONVERSIONS } from "@/lib/inventory/defaultUnitConversions";
import admin from "firebase-admin";


export async function initDefaultUnitConversions() {
  try {
    const batch = adminDb.batch();

    for (const item of MASTER_UNIT_CONVERSIONS) {
      // Prevent duplicates
      const existing = await adminDb
        .collection("inventoryUnitConversions")
        .where("purchaseUnit", "==", item.purchaseUnit)
        .where("consumptionUnit", "==", item.consumptionUnit)
        .limit(1)
        .get();

      if (!existing.empty) {
        continue;
      }

      const docRef = adminDb
        .collection("inventoryUnitConversions")
        .doc();

      batch.set(docRef, {
        ...item,
        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      success: true,
      message:
        "Default unit conversions initialized successfully",
    };
  } catch (error) {
    console.error(
      "initDefaultUnitConversions error",
      error
    );

    return {
      success: false,
      message:
        "Failed to initialize unit conversions",
    };
  }
}