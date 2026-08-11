"use server";

import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/firebaseConfig";
import {
  addressSchimaCheckout,
} from "@/lib/types/addressType";
import { signUpSchema } from "@/lib/types/userType";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function addCustomerAddress(formData: FormData) {
  const recievedData = Object.fromEntries(formData.entries());
  const result = addressSchimaCheckout.safeParse(recievedData);

  const q = query(collection(db, "address"), where("email", "==", recievedData.email));
  const querySnapshot = await getDocs(q);
  let recordId = null;
  querySnapshot.forEach((doc) => {
    recordId = doc.id;
  });

  if (result.success && !recordId) {
    const username = `${recievedData.firstName} ${recievedData.lastName}`;
    try {
      const hashedPassword = await hashPassword(recievedData.password as string);
      const newuser = {
        username,
        email: recievedData.email,
        hashedPassword,
        role: "user",
        isVerfied: true,
        isAdmin: false,
      };
      // await addDoc(collection(db, "user"), newuser);
    } catch (e) {
      console.error("Error adding user: ", e);
    }

    const addressData = {
      ...recievedData,
      password: undefined,
    };

    try {
      await addDoc(collection(db, "address"), addressData);
    } catch (e) {
      console.error("Error adding address: ", e);
    }
  }
}

type addUserReturnT = { id: string };

export async function addUser(formData: FormData): Promise<string> {
  const recievedData = Object.fromEntries(formData.entries());
  const result = signUpSchema.safeParse(recievedData);

  const q = query(collection(db, "user"), where("email", "==", recievedData.email));
  const querySnapshot = await getDocs(q);
  let recordId = null;
  querySnapshot.forEach((doc) => {
    recordId = doc.id;
  });

  let userDocRef = {} as addUserReturnT;
  if (result.success && !recordId) {
    try {
      const hashedPassword = await hashPassword(recievedData.password as string);
      const newuser = {
        username: recievedData.username,
        email: recievedData.email,
        hashedPassword,
        role: "user",
        isVerfied: true,
        isAdmin: false,
      };

      userDocRef = await addDoc(collection(db, "user"), newuser) as unknown as addUserReturnT;
    } catch (e) {
      console.error("Error adding user: ", e);
    }
  }
  return userDocRef.id;
}

export async function newCustomerAddress(formData: FormData) {
  const recievedData = Object.fromEntries(formData.entries());
  const result = addressSchimaCheckout.safeParse(recievedData);

  const q = query(collection(db, "address"), where("email", "==", recievedData.email));
  const querySnapshot = await getDocs(q);
  let recordId = null;
  querySnapshot.forEach((doc) => {
    recordId = doc.id;
  });

  if (result.success && !recordId) {
    const addressData = {
      ...recievedData,
      password: undefined,
    };

    try {
      await addDoc(collection(db, "address"), addressData);
    } catch (e) {
      console.error("Error adding address: ", e);
    }
  }
}

export async function editAddress() {}
