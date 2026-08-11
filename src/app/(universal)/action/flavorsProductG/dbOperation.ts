"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import {
  flavorsProductGType,
  flavorsProductGSchema,
} from "@/lib/types/flavorsProductGType";
import { formatPriceStringToNumber } from "@/utils/formatters";

export async function addNewProduct(formData: FormData) {
  const name = formData.get("name");
  const price = formatPriceStringToNumber(formData.get("price"));
  const productCat = formData.get("productCat");
  const productDesc = formData.get("productDesc");
  const isFeatured = formData.get("isFeatured") === "true";
  const baseProductId = "";

  const receivedData = {
    name,
    price,
    baseProductId,
    productCat,
    productDesc,
    isFeatured,
  };

  const result = flavorsProductGSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors = result.error.issues.reduce((acc, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {} as Record<string, string>);
    return { errors: zodErrors };
  }

  try {
    const docRef = await adminDb.collection("flavorsProductG").add(receivedData);
    console.log("Document written with ID:", docRef.id);
    return { message: "Product saved" };
  } catch (error) {
    console.error("Error adding document:", error);
    return { errors: "Failed to save product" };
  }
}

export async function editProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name");
  const price = formatPriceStringToNumber(formData.get("price"));
  const productCat = formData.get("productCat");
  const productDesc = formData.get("productDesc");

  const receivedData = {
    name,
    price,
    productCat,
    productDesc,
  };

  const result = flavorsProductGSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors = result.error.issues.reduce((acc, issue) => {
      acc[issue.path[0]] = issue.message;
      return acc;
    }, {} as Record<string, string>);
    return { errors: zodErrors };
  }

  try {
    await adminDb.collection("flavorsProductG").doc(id).set(receivedData, { merge: true });
    return { message: "Product updated" };
  } catch (error) {
    console.error("Error updating product:", error);
    return { errors: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<string> {
  try {
    await adminDb.collection("flavorsProductG").doc(id).delete();
    return "ok";
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}

export async function fetchflavorsProductG(): Promise<flavorsProductGType[]> {
  const snapshot = await adminDb.collection("flavorsProductG").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as flavorsProductGType));
}

export async function fetchProductById(id: string): Promise<flavorsProductGType> {
  const docSnap = await adminDb.collection("flavorsProductG").doc(id).get();
  if (!docSnap.exists) {
    throw new Error("Product not found");
  }
  return { id: docSnap.id, ...docSnap.data() } as flavorsProductGType;
}

export async function fetchProductByBaseProductId(id: string): Promise<flavorsProductGType[]> {
  const q = adminDb.collection("flavorsProductG").where("baseProductId", "==", id);
  const snapshot = await q.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as flavorsProductGType));
}
