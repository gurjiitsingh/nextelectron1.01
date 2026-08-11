"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { z } from "zod";
import {
  addOnPorductSchema,
  AddOnProductSchemaType,
  addOnPorductEditSchema,
  
} from "@/lib/types/productAddOnType";
import { addOnType } from "@/lib/types/addOnType";
import { revalidateTag } from "next/cache";

export async function addNewProduct(formData: FormData) {
  const featured_img: boolean = false;
  const name = formData.get("name");
  const price = formData.get("price");
  const baseProductId = formData.get("baseProductId");
  const sortOrder = formData.get("sortOrder") as string;
  const desc = formData.get("desc");
  const isFeatured = featured_img;

  const receivedData = {
    name,
    price,
    baseProductId,
    sortOrder,
    desc,
    isFeatured,
  };

  const result = addOnPorductSchema.safeParse(receivedData);
  let zodErrors = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });

    return Object.keys(zodErrors).length > 0
      ? { errors: zodErrors }
      : { success: true };
  }

  const priceValue = formData.get("price") as string;
  const priceV = parseFloat(priceValue.replace(/,/g, ".")).toFixed(2);
  const priceF = new Number(parseFloat(priceV)).toFixed(2);
  const priceFF = parseFloat(priceF);
  const sortOrderN = parseFloat(sortOrder) as number;

  const data = {
    name,
    price: priceFF,
    sortOrder: sortOrderN,
    desc,
    baseProductId,
    isFeatured,
  };

  try {
    const docRef = await adminDb.collection("productaddon").add(data);
    revalidateTag("addons", "max");
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  const idS = formData.get("baseProductId") as string;
  updateBaseProduct(idS);

  return { message: "Product saved" };
}

async function updateBaseProduct(id: string) {
  const productUpdtedData = {
    flavors: true,
  };

  try {
    const docRef = adminDb.collection("product").doc(id);
    await docRef.update(productUpdtedData);
  } catch (error) {
    console.log("error", error);
    return { errors: "Cannot update" };
  }
}

type rt = {
  errors: string;
};

export async function deleteProduct(
  id: string,
  oldImageUrl: string
): Promise<rt> {
  console.log("out put ", id, oldImageUrl);
  revalidateTag("addons", "max");
  return { errors: "Delete not implemented yet" };
}

export async function editAddOnProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name");
  const price = formData.get("price");
  const desc = formData.get("desc");
  const sortOrder = formData.get("sortOrder");
  const baseProductId = formData.get("baseProductId");
  const isFeatured = formData.get("isFeatured");
  const featured_img: boolean = false;

  const receivedData = {
    id,
    name,
    price,
    desc,
    sortOrder,
    baseProductId,
    isFeatured: featured_img,
  };

  const result = addOnPorductEditSchema.safeParse(receivedData);

  let zodErrors = {};
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
    });

    return Object.keys(zodErrors).length > 0
      ? { errors: zodErrors }
      : { success: true };
  }

  const productUpdtedData = {
    name,
    price,
    desc,
    sortOrder,
    baseProductId,
    isFeatured: featured_img,
  };

  try {
    const docRef = adminDb.collection("productaddon").doc(id);
    await docRef.set(productUpdtedData);
      revalidateTag("addons", "max");
  } catch (error) {
    console.log("error", error);
    return { errors: "Cannot update" };
  }
}

export async function fetchAddOnProducts(): Promise<addOnType[]> {
  const result = await adminDb.collection("productaddon").get();

  const data = [] as addOnType[];
  result.forEach((doc) => {
    const pData = { id: doc.id, ...doc.data() } as addOnType;
    data.push(pData);
  });
  return data;
}

export async function fetchProductAddonById(id: string): Promise<addOnType> {
  const docRef = adminDb.collection("productaddon").doc(id);
  const docSnap = await docRef.get();
  let productData = {} as addOnType;
  if (docSnap.exists) {
    productData = { id: docSnap.id, ...docSnap.data() } as addOnType;
  } else {
    console.log("No such document!");
  }
  return productData;
}

export async function fetchProductAddOnByBaseProductId(
  id: string
): Promise<AddOnProductSchemaType[]> {
  const data = [] as AddOnProductSchemaType[];
  const querySnapshot = await adminDb
    .collection("productaddon")
    .where("baseProductId", "==", id)
    .get();

  querySnapshot.forEach((doc) => {
    const datas = { id: doc.id, ...doc.data() } as AddOnProductSchemaType;
    data.push(datas);
  });
  return data;
}
