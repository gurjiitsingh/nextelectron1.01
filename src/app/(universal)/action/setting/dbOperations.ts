"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { editSettingSchema, settingSchema, settingSchemaType } from "@/lib/types/settingType";
import { SettingsDataType, value } from "@/lib/types/settings";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]+/g, "");
}

export async function addNewsetting(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const value = formData.get("value")?.toString().trim();

  if (!name) return { errors: { value: "Value is required" } };

  const validated = settingSchema.safeParse({ name, value });
  if (!validated.success) {
    const zodErrors = validated.error.issues.reduce((acc, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {} as Record<string, string>);
    return { errors: zodErrors };
  }

  const docId = slugify(name);
  const docRef = adminDb.doc(`settings/${docId}`);
  const existingDoc = await docRef.get();

  if (existingDoc.exists) {
    return { errors: { name: "A setting with this name already exists." } };
  }

  try {
    await docRef.set({ name, value, type: "settings" });
    return { message: { success: "Setting created successfully" } };
  } catch (error) {
    console.error("Firestore error:", error);
    return { errors: { firebase: "Failed to write setting." } };
  }
}

export async function upsertLocaleCurrencySetting1(name: "currency" | "locale", value: string) {
  const trimmedName = name.trim();
  const trimmedValue = value.trim();
  if (!trimmedName || !trimmedValue) return { errors: { value: "Both name and value are required." } };

  const validated = settingSchema.safeParse({ name: trimmedName, value: trimmedValue });
  if (!validated.success) {
    const zodErrors = validated.error.issues.reduce((acc, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {} as Record<string, string>);
    return { errors: zodErrors };
  }

  const docRef = adminDb.doc(`settings/${slugify(trimmedName)}`);
  const existingDoc = await docRef.get();

  try {
    await docRef.set({ name: trimmedName, value: trimmedValue, type: "settings" }, { merge: true });
    return {
      message: {
        success: existingDoc.exists ? "Setting updated successfully." : "Setting created successfully.",
      },
    };
  } catch (error) {
    console.error("Firestore error:", error);
    return { errors: { firebase: "Failed to save setting." } };
  }
}

export async function upsertLocaleCurrencySetting(name: string, value: string) {
  try {
    const docRef = adminDb.doc(`settings/${name}`);
    const existing = await docRef.get();
    await docRef.set({ name, value, type: "country" }, { merge: true });
    return { message: "Setting saved" };
  } catch (error) {
    console.error("Error saving setting:", error);
    return { errors: { firebase: "Error saving setting." } };
  }
}

export async function fetchSettings(): Promise<settingSchemaType[]> {
  const settingsSnapshot = await adminDb.collection("settings").get();
  const settings: settingSchemaType[] = [];
  settingsSnapshot.forEach((doc) => {
    const data = doc.data();
    settings.push({
      name: data.name,
      value: data.value,
      key: doc.id,
      type: data.type,
    });
  });
  return settings;
}

export async function fetchSettingById(docId: string): Promise<settingSchemaType | null> {
  try {
    const docSnap = await adminDb.doc(`settings/${docId}`).get();
    if (!docSnap.exists) return null;

    const data = docSnap.data();
    return {
      name: data!.name || docId,
      value: data!.value || "",
      key: docId,
    };
  } catch (error) {
    console.error("Error fetching setting:", error);
    return null;
  }
}

export async function updateSettingById(docId: string, data: settingSchemaType) {
  try {
    const docRef = adminDb.doc(`settings/${docId}`);
    await docRef.update({ name: data.name, value: data.value, type: "settings" });
  } catch (error) {
    console.error("Error updating setting:", error);
    throw error;
  }
}

export async function deleteSettingById(docId: string): Promise<void> {
  try {
    await adminDb.doc(`settings/${docId}`).delete();
    console.log(`Setting "${docId}" deleted successfully.`);
  } catch (error) {
    console.error("Failed to delete setting:", error);
    throw error;
  }
}

export async function deletesetting(id: string) {
  await adminDb.doc(`settings/${id}`).delete();

  // const segments = oldImageUrl.split("/");
  // const imageName = segments[segments.length - 2] + "/" + segments[segments.length - 1];
  // const publicId = imageName.split(".")[0];

  // try {
  //   const result = await deleteImage(publicId);
  //   console.log("Image delete result:", result);
  // } catch (error) {
  //   console.error(error);
  //   return { errors: "Something went wrong, cannot delete product picture." };
  // }

  return { message: { success: "Deleted product" } };
}

export async function addNewsetting1(formData: FormData) {
  const name = formData.get("name");
  const value = formData.get("value");

  const result = settingSchema.safeParse({ name, value });
  if (!result.success) {
    const zodErrors = result.error.issues.reduce((acc, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {} as Record<string, string>);
    return { errors: zodErrors };
  }

  try {
    const docRef = await adminDb.collection("settings").add({ name, value });
    console.log("Document written with ID:", docRef.id);
    return { message: { success: "Setting Created" } };
  } catch (e) {
    console.error("Error adding document:", e);
    return { errors: { firebase: "Error adding setting." } };
  }
}

export async function editsetting(formData: FormData) {
  const id = formData.get("id") as string;
  const value = formData.get("value") as string;

  const result = editSettingSchema.safeParse({ id, value });
  if (!result.success) {
    const zodErrors = result.error.issues.reduce((acc, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {} as Record<string, string>);
    return { errors: zodErrors };
  }

  try {
    await adminDb.doc(`settings/${id}`).set({ id, value });
  } catch (error) {
    console.log("error", error);
    return { errors: "Cannot update" };
  }
}

export const setPickupDiscount = async (value: number) => {
  if (typeof value !== "number" || isNaN(value)) throw new Error("Invalid discount value");
  try {
    await adminDb.doc("settings/pickup_discount").set({ value });
    console.log("Pickup discount updated:", value);
  } catch (error) {
    console.error("Error updating pickup discount:", error);
    throw error;
  }
};

export const setDisplayCategory = async (value: string) => {
  if (typeof value !== "string") throw new Error("Invalid value");
  try {
    await adminDb.doc("settings/display_category").set({ value });
    console.log("Display category updated:", value);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export async function fetchsettingById(id: string): Promise<settingSchemaType> {
  const docSnap = await adminDb.doc(`settings/${id}`).get();
  const data = docSnap.data();
  return { key: docSnap.id, ...(data || {}) } as settingSchemaType;
}

export async function getAllSettings(): Promise<SettingsDataType> {
  const snapshot = await adminDb.collection("settings").get();
  const allSettings: SettingsDataType = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    allSettings[doc.id] = data.value as value;
  });
   return allSettings;
}
