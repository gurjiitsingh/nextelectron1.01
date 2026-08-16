
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/store/CartContext';
import {
  calculateBill,
  groupBillItems,
} from '@/lib/billing/calculateBill';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

type KitchenViewProps = {
  onSuccess?: () => void;
};

export default function KitchenView({
  onSuccess,
}: KitchenViewProps) {
  const { activeTable } = usePosSession();

  const { theme, background } = usePosTheme();

  const router = useRouter();

  const currentTableId =
    activeTable?.tableId ?? 'T1';

  const currentTableName =
    activeTable?.tableName ?? 'T1';

  const [kitchenItems, setKitchenItems] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const {
    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // LOAD KITCHEN ITEMS
  // =====================================================

  useEffect(() => {
    loadKitchen();
  }, [currentTableId]);

  async function loadKitchen() {
    if (!currentTableId) return;

    try {
      setLoading(true);

      const rows =
        await window.posApi.getPendingKotByTable(
          currentTableId
        );

      setKitchenItems(rows);
    } catch (e) {
      console.error(
        'Failed to load kitchen items',
        e
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // BILL STATE
  // =====================================================

  const [customerName, setCustomerName] =
    useState('Customer');

  const [customerPhone, setCustomerPhone] =
    useState('');

  const [discount, setDiscount] =
    useState(0);

  const [deliveryFee, setDeliveryFee] =
    useState(0);

  const [paymentMode, setPaymentMode] =
    useState<
      'CASH' |
      'CARD' |
      'UPI' |
      'WALLET' |
      'CREDIT'
    >('CASH');

  const [paidAmount, setPaidAmount] =
    useState(0);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =====================================================
  // BILL ITEMS
  // =====================================================

  const billItems = useMemo(
    () => groupBillItems(kitchenItems),
    [kitchenItems]
  );

  const calculation = useMemo(
    () =>
      calculateBill(
        billItems,
        discount,
        deliveryFee
      ),
    [
      billItems,
      discount,
      deliveryFee,
    ]
  );

  const dueAmount = Math.max(
    0,
    calculation.grandTotal -
    Number(paidAmount || 0)
  );

  const paymentStatus =
    paymentMode === 'CREDIT'
      ? 'CREDIT'
      : dueAmount > 0
        ? 'PARTIAL'
        : 'PAID';

  // =====================================================
  // FINALIZE BILL
  // =====================================================

  async function handleCheckout() {
    if (processing) return;

    try {
      setProcessing(true);
      setError(null);

      const result =
        await window.posApi.createBill({
          tableNo: 'T1',

          orderType: 'DINE_IN',

          customerName:
            customerName.trim() ||
            'Customer',

          customerPhone:
            customerPhone.trim(),

          discountTotal:
            calculation.discount,

          deliveryFee:
            calculation.deliveryFee,

          deliveryTax: 0,

          paymentMode,

          paymentStatus,

          paidAmount:
            Number(paidAmount) || 0,

          payments:
            paidAmount > 0
              ? [
                {
                  mode: paymentMode,
                  amount:
                    Number(paidAmount),
                },
              ]
              : [],

          deviceId: 'POS',
          deviceName: 'Electron POS',
          appVersion: '1.0',

          businessDate:
            new Date()
              .toISOString()
              .slice(0, 10),

          currency: '₹',
        });

      if (!result.success) {
        throw new Error(
          result.error ||
          'Failed to create bill'
        );
      }

      console.log(
        'BILL CREATED',
        result
      );

      setKitchenItems([]);

      await loadKitchen();

      setRightSidebarView('cart');

      onSuccess?.();
    } catch (e: any) {
      console.error(
        'BILL FAILED',
        e
      );

      setError(
        e?.message ||
        'Payment failed'
      );
    } finally {
      setProcessing(false);
    }
  }

  const groupedKitchenItems = useMemo(() => {
  const groups: Record<string, typeof kitchenItems> = {};

  for (const item of kitchenItems) {
    const kotNumber =
      item.kotNumber || 'NO KOT';

    if (!groups[kotNumber]) {
      groups[kotNumber] = [];
    }

    groups[kotNumber].push(item);
  }

  return Object.entries(groups);
}, [kitchenItems]);
  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`
        flex
        h-full
        flex-col
        mb-16
        ${background.className}
        ${background.text}
      `}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className={`
          shrink-0
          border-b
          ${background.border}
          px-4
          py-2
        `}
      >

        <div className="flex items-center justify-between">

          <div
            className="
            mt-1
            text-sm
            opacity-60
          "
          >
            {currentTableName}
          </div>
          <div>
            {kitchenItems.length} items
          </div>
        </div>



      </div>

      {/* ================================================= */}
      {/* ITEM LIST */}
      {/* ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          app-scrollbar
        "
      >

        {loading ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >
            <p className="text-sm opacity-60">
              Loading...
            </p>
          </div>

        ) : kitchenItems.length === 0 ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >
            <p className="text-sm opacity-60">
              No kitchen items
            </p>
          </div>

        ) : (

          <div
            className={`
              divide-y
              ${background.divide}
            `}
          >

          {groupedKitchenItems.map(
  ([kotNumber, items]) => {

    const firstItem = items[0];

    return (
      <div
        key={kotNumber}
        className="
          border-b
          px-3
          py-3
        "
      >

        {/* KOT HEADER */}

        <div
          className="
            mb-2
            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              text-xs
              font-bold
            "
            style={{
              color:
                theme.primaryText,
            }}
          >
            {kotNumber}
          </span>


          {/* KOT STATUS */}

          <span
            className="
              rounded-lg
              px-2
              py-1
              text-[10px]
              font-semibold
            "
            style={{
              backgroundColor:
                theme.primarySelected,

              color:
                theme.primaryText,
            }}
          >
            {firstItem?.status}
          </span>

        </div>


        {/* KOT ITEMS */}

        <div
          className="
            space-y-2
          "
        >

          {items.map((item) => (

            <div
              key={item.id}
            >

              {/* ITEM NAME */}

              <p
                className="
                  text-xs
                  opacity-60
                "
              >
                {item.quantity} × {item.name}
              </p>


              {/* NOTE */}

              {item.note ? (
                <p
                  className="
                    mt-1
                    text-xs
                    opacity-60
                  "
                >
                  {item.note}
                </p>
              ) : null}

            </div>

          ))}

        </div>

      </div>
    );
  }
)}

          </div>

        )}

      </div>







    </div>
  );
}

