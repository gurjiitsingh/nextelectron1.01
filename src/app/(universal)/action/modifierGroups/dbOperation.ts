"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { newModifierGroupSchema } from "@/lib/types/modifierGroupType";

export async function addModifierGroup(formData: FormData) {
  try {
    const data = {
      name: formData.get("name"),
      minSelection: Number(formData.get("minSelection")),
      maxSelection: Number(formData.get("maxSelection")),
      sortOrder: Number(formData.get("sortOrder")),
      status: formData.get("status"),
    };

    const parsed = newModifierGroupSchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        errors[e.path[0]] = e.message;
      });
      return { errors };
    }

    await adminDb.collection("modifierGroups").add({
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { general: "Failed to save" } };
  }
}


export async function getModifierGroups() {
  try {
    const snap = await adminDb
      .collection("modifierGroups")
      .where("status", "==", "published")
     // .orderBy("sortOrder", "asc")
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Failed to fetch modifier groups", e);
    return [];
  }
}



export async function getModifierGroupsAdmin() {
  try {
    const [groupSnap, itemsSnap] = await Promise.all([
      adminDb.collection("modifierGroups")
        .where("status", "==", "published")
        .get(),

      adminDb.collection("modifierItems").get(),
    ]);

    const allItems = itemsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const groups = groupSnap.docs.map((doc) => {
      const groupData = doc.data();

      const items = allItems.filter(
        (item) => item.id === doc.id
      );

      return {
        id: doc.id,
        ...groupData,
        items,
      };
    });

    return groups;
  } catch (e) {
    console.error("Failed to fetch modifier groups", e);
    return [];
  }
}



export async function getModifierGroupById(id: string) {
  try {
    const doc = await adminDb.collection("modifierGroups").doc(id).get();

    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}


import { revalidatePath } from "next/cache";

export async function deleteModifierGroup(id: string) {
  try {
    if (!id) {
      return { errors: { general: "Missing ID" } };
    }

    await adminDb.collection("modifierGroups").doc(id).delete();

    // ✅ THIS IS KEY
    revalidatePath("/admin/modifier-groups");

    return { success: true };
  } catch (e) {
    console.error("Failed to delete modifier group", e);
    return { errors: { general: "Failed to delete" } };
  }
}