"use server";

import { z } from "zod";
import { adminDb } from "@/lib/firebaseAdmin";

import {
  sauceProductType,
  saucePorductSchema,
} from "@/lib/types/productSaucesType";
import { formatPriceStringToNumber } from "@/utils/formatters";

export async function addNewProduct(formData: FormData) {
  const isFeatured = formData.get("isFeatured") === "true";

  const receivedData = {
    name: formData.get("name"),
    price: formatPriceStringToNumber(formData.get("price") as string),
    baseProductId: "",
    productCat: formData.get("productCat"),
    productDesc: formData.get("productDesc"),
    isFeatured,
  };

  const result = saucePorductSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
    return { errors: zodErrors };
  }

  try {
    const docRef = await adminDb.collection("productsauces").add(receivedData);
    console.log("Document written with ID:", docRef.id);
    return { message: "Product saved" };
  } catch (error) {
    console.error("Error adding document:", error);
    return { errors: "Failed to add product." };
  }
}

export async function deleteProduct(id: string): Promise<string> {
  try {
    await adminDb.collection("productsauces").doc(id).delete();
    return "ok";
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw new Error("Delete operation failed");
  }
}

export async function editProduct(formData: FormData) {
  const id = formData.get("id") as string;

  const receivedData = {
    name: formData.get("name"),
    price: formatPriceStringToNumber(formData.get("price") as string),
    productCat: formData.get("productCat"),
    productDesc: formData.get("productDesc"),
  };

  const result = saucePorductSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
    return { errors: zodErrors };
  }

  try {
    await adminDb.collection("productsauces").doc(id).set(receivedData);
    return { message: "Product updated successfully." };
  } catch (error) {
    console.error("Error updating document:", error);
    return { errors: "Cannot update product" };
  }
}

export async function fetchProductSauces(): Promise<sauceProductType[]> {
  try {
    const snapshot = await adminDb.collection("productsauces").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as sauceProductType[];
  } catch (error) {
    console.error("Failed to fetch sauces:", error);
    throw new Error("Error retrieving sauce products");
  }
}

export async function fetchProductById(id: string): Promise<sauceProductType> {
  try {
    const docSnap = await adminDb.collection("productsauces").doc(id).get();
    if (!docSnap.exists) throw new Error("No such document!");
    return { id: docSnap.id, ...docSnap.data() } as sauceProductType;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw error;
  }
}

export async function fetchProductByBaseProductId(id: string): Promise<sauceProductType[]> {
  try {
    const querySnap = await adminDb
      .collection("productsauces")
      .where("baseProductId", "==", id)
      .get();

    return querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as sauceProductType[];
  } catch (error) {
    console.error("Error fetching by baseProductId:", error);
    throw error;
  }
}
