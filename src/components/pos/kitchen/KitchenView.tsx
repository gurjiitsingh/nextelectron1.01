
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

          <h2
            className="
              text-base
              font-semibold
            "
            style={{
              color:
                theme.primaryText,
            }}
          >
            Kitchen Orders
          </h2>

          <span
            className="
              rounded-lg
              px-2
              py-1
              text-xs
              font-medium
            "
            style={{
              backgroundColor:
                theme.primaryLight,

              color:
                theme.primaryText,
            }}
          >
            {kitchenItems.length} items
          </span>

        </div>

        <p
          className="
            mt-1
            text-xs
            opacity-60
          "
        >
          Table: {currentTableName}
        </p>

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

            {kitchenItems.map((item) => (

              <div
                key={item.id}
                className="
                  px-3
                  py-3
                "
              >

                {/* ITEM HEADER */}

                <div
                  className="
                    mb-1
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className="
                      text-xs
                      font-semibold
                    "
                    style={{
                      color:
                        theme.primaryText,
                    }}
                  >
                    {item.kotNumber}
                  </span>

                  {/* STATUS */}

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
                    {item.status}
                  </span>

                </div>

                {/* ITEM NAME */}

                <p
                  className="
                    text-sm
                    font-medium
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

        )}

      </div>

      {/* ================================================= */}
      {/* BILL BUTTON */}
      {/* ================================================= */}

      <div
        className={`
          shrink-0
          flex
          items-center
          justify-center
          border-t
          ${background.border}
          p-2
        `}
        style={{
          backgroundColor:
            theme.primaryLight,
        }}
      >

        <button
          type="button"
          onClick={handleCheckout}
          disabled={
            loading ||
            kitchenItems.length === 0 ||
            processing
          }
          className="
            h-11
            w-44
            rounded-xl
            text-sm
            font-semibold
            text-white
            transition-all
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          style={{
            backgroundColor:
              theme.primary,
          }}
          onMouseEnter={(e) => {
            if (
              !loading &&
              kitchenItems.length > 0 &&
              !processing
            ) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              theme.primary;
          }}
        >
          {processing
            ? 'PROCESSING...'
            : 'BILL'}
        </button>

      </div>

      {/* ================================================= */}
      {/* CALCULATIONS */}
      {/* ================================================= */}

      <div
        className="
          shrink-0
          space-y-2
          px-4
          py-3
          text-sm
        "
      >

        <div className="flex justify-between opacity-70">
          <span>Subtotal</span>

          <span>
            ₹
            {calculation.itemSubtotal.toFixed(
              2
            )}
          </span>
        </div>

        <div className="flex justify-between opacity-70">
          <span>Tax</span>

          <span>
            ₹
            {calculation.itemTax.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between opacity-70">
          <span>Discount</span>

          <span>
            ₹
            {calculation.discount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between opacity-70">
          <span>Delivery</span>

          <span>
            ₹
            {calculation.deliveryFee.toFixed(
              2
            )}
          </span>
        </div>

        {/* GRAND TOTAL */}

        <div
          className={`
            flex
            justify-between
            border-t
            ${background.border}
            pt-2
            text-base
            font-semibold
          `}
          style={{
            color:
              theme.primaryText,
          }}
        >
          <span>
            Grand Total
          </span>

          <span>
            ₹
            {calculation.grandTotal.toFixed(
              2
            )}
          </span>
        </div>

        {/* DUE */}

        <div
          className="
            flex
            justify-between
            rounded-lg
            px-2
            py-1
            text-sm
            font-medium
          "
          style={{
            backgroundColor:
              dueAmount > 0
                ? theme.primaryLight
                : 'transparent',

            color:
              dueAmount > 0
                ? theme.primaryText
                : undefined,
          }}
        >
          <span>Due</span>

          <span>
            ₹{dueAmount.toFixed(2)}
          </span>
        </div>

      </div>

      {/* ================================================= */}
      {/* CUSTOMER PHONE */}
      {/* ================================================= */}

      <div className="px-4 pb-2">

        <input
          value={customerPhone}
          onChange={(e) =>
            setCustomerPhone(
              e.target.value
            )
          }
          placeholder="Phone"
          className={`
            w-full
            rounded-xl
            border
            ${background.border}
            px-3
            py-2
            text-sm
            outline-none
            transition
          `}
          onFocus={(e) => {
            e.currentTarget.style.borderColor =
              theme.primary;

            e.currentTarget.style.boxShadow =
              `0 0 0 2px ${theme.primaryLight}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor =
              '';

            e.currentTarget.style.boxShadow =
              '';
          }}
        />

      </div>

      {/* ================================================= */}
      {/* PAID AMOUNT */}
      {/* ================================================= */}

      <div className="px-4 pb-3">

        <input
          type="number"
          value={paidAmount}
          onChange={(e) =>
            setPaidAmount(
              Number(e.target.value)
            )
          }
          placeholder="Paid amount"
          className={`
            w-full
            rounded-xl
            border
            ${background.border}
            px-3
            py-2
            text-sm
            outline-none
            transition
          `}
          onFocus={(e) => {
            e.currentTarget.style.borderColor =
              theme.primary;

            e.currentTarget.style.boxShadow =
              `0 0 0 2px ${theme.primaryLight}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor =
              '';

            e.currentTarget.style.boxShadow =
              '';
          }}
        />

      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error ? (
        <div
          className="
            mx-4
            mb-3
            rounded-xl
            px-3
            py-2
            text-xs
            font-medium
          "
          style={{
            backgroundColor:
              theme.primaryLight,

            color:
              theme.primaryText,
          }}
        >
          {error}
        </div>
      ) : null}

    </div>
  );
}

