import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }

      return session;
    },

    async authorized() {
      return true;
    },
  },

  ...authConfig,
});


// import NextAuth from "next-auth";
// import { authConfig } from "./auth.config";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//   },
//   ...authConfig,
// });