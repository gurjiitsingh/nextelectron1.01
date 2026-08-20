"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";


// =====================================================
// TYPES
// =====================================================

export type PosUser = {
  userId: string;
  outletId: string;
  fullName: string;
  username: string;
  mobile: string;
  employeeId: string;
  role: string;
};


// =====================================================
// CONTEXT TYPE
// =====================================================

type PosAuthContextType = {
  currentUser: PosUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  login: (
    userId: string,
    pin: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  logout: () => void;
};


// =====================================================
// CONTEXT
// =====================================================

const PosAuthContext =
  createContext<PosAuthContextType | undefined>(
    undefined
  );


// =====================================================
// PROVIDER
// =====================================================

export function PosAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentUser, setCurrentUser] =
    useState<PosUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    // For now we intentionally do NOT persist
    // the login session.
    //
    // Every time POS/Electron starts,
    // user must login again.

    setIsLoading(false);
  }, []);


  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (
    userId: string,
    pin: string
  ) => {
    try {
      setIsLoading(true);

      const result =
        await window.posApi.loginUser({
          userId,
          pin,
        });

      if (!result?.success) {
        return {
          success: false,
          error:
            result?.error ||
            "Login failed.",
        };
      }


      // ===============================================
      // LOGIN SUCCESS
      // ===============================================

      setCurrentUser(result.user);

      return {
        success: true,
      };

    } catch (error) {
      console.error(
        "POS login error:",
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Login failed.",
      };

    } finally {
      setIsLoading(false);
    }
  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    setCurrentUser(null);
  };


  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value: PosAuthContextType = {
    currentUser,
    isLoggedIn:
      currentUser !== null,
    isLoading,
    login,
    logout,
  };


  return (
    <PosAuthContext.Provider
      value={value}
    >
      {children}
    </PosAuthContext.Provider>
  );
}


// =====================================================
// HOOK
// =====================================================

export function usePosAuth() {
  const context =
    useContext(PosAuthContext);

  if (!context) {
    throw new Error(
      "usePosAuth must be used inside PosAuthProvider"
    );
  }

  return context;
}