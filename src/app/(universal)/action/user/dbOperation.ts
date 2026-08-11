'use server';

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { TuserSchem, userType } from "@/lib/types/userType";
import { FieldValue } from "firebase-admin/firestore";
import admin from 'firebase-admin';


/**
 * Add a new user if email isn't already in use.
 * Returns the user UID.
 */
export async function addUserDirect(
  formData: FormData
): Promise<string | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
   const role = formData.get("role") as string;
  let username = (formData.get("username") || undefined) as
    | string
    | undefined;

  // Already exists in Firebase Auth?
  try {
    const existingAuthUser =
      await admin.auth().getUserByEmail(email);

    return existingAuthUser.uid;
  } catch {
    // User doesn't exist -> continue
  }

  username ??= `${firstName} ${lastName}`;

  try {
    // Create Firebase Auth user
    const authUser = await admin.auth().createUser({
      email,
      password,
      displayName: username,
      emailVerified: true,
    });

    const hashedPassword = await hashPassword(password);

    const newUser = {
      uid: authUser.uid,
      username,
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
      isVerified: true,
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Store in Firestore using UID as document id
    await adminDb
      .collection("users")
      .doc(authUser.uid)
      .set(newUser);

    return authUser.uid;
  } catch (e) {
    console.error("Error adding user:", e);
    return undefined;
  }
}


export async function addUserDirectPrimaryMOB(
  formData: FormData
): Promise<string | undefined> {

 
  const email = (formData.get("email") || "") as string;
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") || "") as string;
  const lastName = (formData.get("lastName") || "") as string;
  const mobNo = (formData.get("mobNo") || "") as string;

  let username = (formData.get("username") || undefined) as string | undefined;

  if (!mobNo) {
    console.error("Mobile number is required");
    return undefined;
  }
 console.log("user data----",email,password,firstName,lastName,mobNo)
  // 🔍 1️⃣ Search existing user by mobile
  const existing = await adminDb
    .collection("users")
    .where("mobNo", "==", mobNo)
    .limit(1)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  // fallback username
  username ??= `${firstName} ${lastName}`.trim() || mobNo;

  try {
    const hashedPassword = await hashPassword(password);

    const newUser = {
      username,
      firstName,
      lastName,
      email,
      mobNo,
      hashedPassword,
      role: "user",
      isVerified: true,
      isAdmin: false,
      time: new Intl.DateTimeFormat("de", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
      }).format(new Date()),
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("users").add(newUser);

    return docRef.id;

  } catch (e) {
    console.error("Error adding user by mobile:", e);
    return undefined;
  }
}

/**
 * Search a user by userId field (custom key).
 */
export async function searchUserById(id: string | undefined): Promise<TuserSchem> {
  let data = {} as TuserSchem;
  if (id) {
    const snapshot = await adminDb
      .collection("users")
      .where("userId", "==", id)
      .get();

    if (!snapshot.empty) {
      data = snapshot.docs[0].data() as TuserSchem;
    }
  }
  return data;
}

/**
 * Retrieve all users from Firestore.
 */
export async function fetchAllUsers(): Promise<userType[]> {
  const data: userType[] = [];
  const snapshot = await adminDb.collection("users").get();

  snapshot.forEach((doc) => {
    const docData = doc.data();

    data.push({
      id: doc.id,
      email: docData.email || "",
      hashedPassword: docData.hashedPassword || "",
      isAdmin: docData.isAdmin ?? false,
      isVerfied: docData.isVerified ?? false,
      role: docData.role || "user",
      username: docData.username || "",
      time: docData.time || "",
      createdAt: docData.createdAt?.toDate().toISOString() || undefined,
    });
  });

  return data;
}

/**
 * Delete a user document by its Firestore ID.
 */
export async function deleteUser(id: string): Promise<{ message: { success: string } }> {
  await adminDb.collection("users").doc(id).delete();
  return { message: { success: "ok" } };
}

/**
 * Add an email to the unsubscribe collection.
 */
export async function unsubscribeUser(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    await adminDb.collection("unsubscribedEmails").doc(email).set({
      email,
      unsubscribedAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Failed to unsubscribe:", error);
    return false;
  }
}



export async function unsbscribeUser(email: string): Promise<boolean> {
  try {
    if (!email) return false;

    await adminDb.collection("unsubscribedEmails").doc(email).set({
      email,
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to unsubscribe user:", error);
    return false;
  }
}