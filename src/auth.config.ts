import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import { adminDb } from "./lib/firebaseAdmin";

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        const snapshot = await adminDb
          .collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        const user = doc.data();
        const isValid = await bcrypt.compare(password, user.hashedPassword)
       
        if (!isValid) return null;
       return {
  id: doc.id,
  email: user.email,
  role: user.role, 
};
      },
    }),
  ],
} satisfies NextAuthConfig;