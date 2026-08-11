// src/lib/firebaseAdmin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";   //  Add this
import { readFileSync } from "fs";
import path from "path";

const relativePath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;
const serviceAccountPath = path.join(
  process.cwd(),
  relativePath || "firebase-service-account.json"
);

if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();   //  Export Admin Auth
