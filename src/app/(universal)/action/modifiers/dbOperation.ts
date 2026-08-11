"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { newModifierItemSchema } from "@/lib/types/modifierItemType";

export async function addModifierItem(formData: FormData) {
  try {
    const data = {
      name: formData.get("name"),
      groupId: formData.get("groupId"),
      price: Number(formData.get("price")),
      sortOrder: Number(formData.get("sortOrder")),
      status: formData.get("status"),
      isDefault: formData.get("isDefault") === "true",
    };

    const parsed = newModifierItemSchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        errors[e.path[0]] = e.message;
      });
      return { errors };
    }

    await adminDb.collection("modifierItems").add({
      ...parsed.data,
      priceMap: {},
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { general: "Failed to save" } };
  }
}



export async function getModifierItemsAdmin() {
  try {
    const [itemsSnap, groupsSnap] = await Promise.all([
      adminDb.collection("modifierItems").get(),
      adminDb.collection("modifierGroups").get(),
    ]);

    const groupsMap: Record<string, string> = {};

    groupsSnap.docs.forEach((doc) => {
      groupsMap[doc.id] = doc.data().name;
    });

    const items = itemsSnap.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        groupName: groupsMap[data.groupId] || "Unknown", // ✅ attach group name
      };
    });

    return items;
  } catch (e) {
    console.error("Failed to fetch modifier items", e);
    return [];
  }
}


export async function getModifierItemsByGroup(groupId: string) {
  const snap = await adminDb
    .collection("modifierItems")
    .where("groupId", "==", groupId)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}


export async function getModifierItemById(id: string) {
  try {
    if (!id) return null;

    const doc = await adminDb.collection("modifierItems").doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    return {
      id: doc.id,
      ...data,
    };
  } catch (e) {
    console.error("Failed to fetch modifier item by ID", e);
    return null;
  }
}


export async function updateModifierItem(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { errors: { general: "Missing ID" } };
    }

    const data = {
      name: formData.get("name"),
      groupId: formData.get("groupId"),
      price: Number(formData.get("price")),
      sortOrder: Number(formData.get("sortOrder")),
      status: formData.get("status"),
      isDefault: formData.get("isDefault") === "true",
    };

    // ✅ Validate using same schema
    const parsed = newModifierItemSchema.safeParse(data);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((e) => {
        errors[e.path[0]] = e.message;
      });
      return { errors };
    }

    // ✅ Update document
    await adminDb.collection("modifierItems").doc(id).update({
      ...parsed.data,
      updatedAt: new Date().toISOString(), // optional but recommended
    });

    return { success: true };
  } catch (e) {
    console.error("Failed to update modifier item", e);
    return { errors: { general: "Failed to update" } };
  }
}



import { revalidatePath } from "next/cache";

export async function deleteModifierItem(id: string) {
 
  try {
    if (!id) {
      return { errors: { general: "Missing ID" } };
    }

    await adminDb.collection("modifierItems").doc(id).delete();

    // ✅ IMPORTANT (refresh server data)
    revalidatePath("/admin/modifier-groups");

    return { success: true };
  } catch (e) {
    console.error("Failed to delete modifier item", e);
    return { errors: { general: "Failed to delete" } };
  }
}

// export async function getModifierGroupsWithItems(productId: string) {
//   try {
//     // 1. Get mapping (product → groupIds)
//     const mappingSnap = await adminDb
//       .collection("productModifiers")
//       .where("productId", "==", productId)
//       .get();

//     const groupIds = mappingSnap.docs.map((doc) => doc.data().groupId);

//     if (groupIds.length === 0) return [];

//     // 2. Get groups
//     const groupSnap = await adminDb
//       .collection("modifierGroups")
//       .where("__name__", "in", groupIds)
//       .get();

//     const groups = groupSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // 3. Get all items for these groups
//     const itemsSnap = await adminDb
//       .collection("modifierItems")
//       .where("groupId", "in", groupIds)
//       .get();

//     const items = itemsSnap.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // 4. Map group → items
//     const result = groups.map((group) => ({
//       group,
//       items: items
//         .filter((item) => item.groupId === group.id)
//         .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
//     }));
    

//     return result;
//   } catch (error) {
//     console.error("Error fetching modifiers:", error);
//     return [];
//   }
// }