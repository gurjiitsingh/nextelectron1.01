"use client";

import {
  usePosAuth,
} from "@/store/PosAuthContext";
import LoginScreen from "../LoginScreen";

 


// =====================================================
// POS AUTH GATE
// =====================================================

export default function PosAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    currentUser,
    isLoading,
  } = usePosAuth();


  // ===================================================
  // AUTH INITIALIZATION
  // ===================================================

  if (isLoading) {
    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-black/5
        "
      >

        <div
          className="
            text-xs
            opacity-50
          "
        >
          Loading POS...
        </div>

      </div>
    );
  }


  // ===================================================
  // AUTHENTICATED
  // ===================================================

  if (currentUser) {
    return (
      <div className="h-full w-full">
        {children}
      </div>
    );
  }


  // ===================================================
  // LOCKED POS
  // ===================================================

  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
      "
    >

      {/* =================================================
          POS BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
          blur-[5px]
          scale-[1.015]
          opacity-60
          pointer-events-none
          select-none
        "
      >
        {children}
      </div>


      {/* =================================================
          DARK / GLASS OVERLAY
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-black/20
          backdrop-blur-[2px]
        "
      />


      {/* =================================================
          LOGIN
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          p-4
        "
      >

        <LoginScreen />

      </div>

    </div>
  );
}