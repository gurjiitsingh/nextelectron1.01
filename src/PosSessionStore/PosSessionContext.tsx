'use client';

import {
  createContext,
  useContext,
  useState,
} from 'react';

export type ActiveTable = {
  tableId: string;      // Firestore id
  tableName: string;    // Display name
  status?: string;
};

type PosSessionContextType = {
  activeTable: ActiveTable | null;
  setActiveTable: (
    table: ActiveTable | null
  ) => void;
};

const PosSessionContext =
  createContext<PosSessionContextType | undefined>(
    undefined
  );

export function PosSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTable, setActiveTable] =
    useState<ActiveTable | null>(null);

  return (
    <PosSessionContext.Provider
      value={{ activeTable, setActiveTable }}
    >
      {children}
    </PosSessionContext.Provider>
  );
}

export function usePosSession() {
  const ctx = useContext(PosSessionContext);

  if (!ctx) {
    throw new Error(
      'usePosSession must be used within PosSessionProvider'
    );
  }

  return ctx;
}