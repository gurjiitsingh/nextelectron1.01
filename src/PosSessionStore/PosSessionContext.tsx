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

export type BillDraft = {
  customerName: string;
  customerPhone: string;
  discount: number;
  discountPercent: number;
  deliveryFee: number;
  paymentMode:
    | 'CASH'
    | 'CARD'
    | 'UPI'
    | 'WALLET'
    | 'CREDIT';
  paidAmount: number;
};

type PosSessionContextType = {
  activeTable: ActiveTable | null;
  setActiveTable: (
    table: ActiveTable | null
  ) => void;

  billDraft: BillDraft;
  setBillDraft: (
    draft: BillDraft
  ) => void;

  resetBillDraft: () => void;
};

const PosSessionContext =
  createContext<PosSessionContextType | undefined>(
    undefined
  );

const initialBillDraft: BillDraft = {
  customerName: 'Customer',
  customerPhone: '',
  discount: 0,
  discountPercent: 0,
  deliveryFee: 0,
  paymentMode: 'CASH',
  paidAmount: 0,
};

export function PosSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTable, setActiveTable] =
    useState<ActiveTable | null>(null);

  const [billDraft, setBillDraft] =
    useState<BillDraft>(initialBillDraft);

  function resetBillDraft() {
    setBillDraft(initialBillDraft);
  }

  return (
    <PosSessionContext.Provider
      value={{
        activeTable,
        setActiveTable,

        billDraft,
        setBillDraft,
        resetBillDraft,
      }}
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