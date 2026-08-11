"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({
      callbackUrl: "/auth/login", // ✅ direct redirect
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-600 text-lg animate-pulse">
        Logging you out...
      </p>
    </div>
  );
}