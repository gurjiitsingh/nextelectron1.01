'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCartContext } from '@/store/CartContext';
import { calculateBill, groupBillItems } from '@/lib/billing/calculateBill';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
type BillProps = {
  onSuccess?: () => void;
};

export default function Bill({
  onSuccess,
}: BillProps) {

  const { activeTable } = usePosSession();

const currentTableId =
  activeTable?.tableId ||
  activeTable?.tableName ||
  'T1';

const currentTableName =
  activeTable?.tableName || 'N/A';

  const [billRows, setBillRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // LOAD BILL ITEMS FOR CURRENT TABLE
  // =====================================================
useEffect(() => {
  loadBillItems();
}, [currentTableId]);

 async function loadBillItems() {
  if (!currentTableId) return;

  try {
    setLoading(true);

    console.log('LOAD BILL ITEMS', currentTableId);

    const rows =
      await window.posApi.getBillItems(currentTableId);

    console.log('BILL ROWS', rows);

    setBillRows(rows);
  } catch (e) {
    console.error(
      'Failed to load bill items',
      e
    );
  } finally {
    setLoading(false);
  }
}

  // =====================================================
  // FORM STATE
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
    useState<'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'CREDIT'>('CASH');

  const [paidAmount, setPaidAmount] =
    useState(0);

  // =====================================================
  // GROUP BILL ITEMS (MERGED QTY)
  // =====================================================
  const billItems = useMemo(
    () => groupBillItems(billRows),
    [billRows]
  );

  const calculation = useMemo(
    () =>
      calculateBill(
        billItems,
        discount,
        deliveryFee
      ),
    [billItems, discount, deliveryFee]
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
       tableNo: currentTableId,
          orderType: 'DINE_IN',

          customerName:
            customerName.trim() || 'Customer',

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

      console.log('BILL CREATED', result);

      // clear UI immediately
      setBillRows([]);

      // reload from database
      await loadBillItems();

      // go back to cart
     // setRightSidebarView('cart');

      onSuccess?.();
    } catch (e: any) {
      console.error('BILL FAILED', e);

      setError(
        e?.message || 'Payment failed'
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white mb-16">

      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Bill Items
          </h2>

          <span className="text-sm text-gray-500">
            {billItems.length} items
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
       Table: {currentTableName}
        </p>
      </div>

      {/* Item List */}
      <div className="min-h-0 flex-1 overflow-y-auto app-scrollbar">

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          </div>
        ) : billItems.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              No bill items
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">

            {billItems.map((item) => (
              <div
                key={item.id}
                className="px-3 py-3"
              >
                <div className="flex items-center justify-between">

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </p>

                    {item.note ? (
                      <p className="truncate text-xs text-gray-500">
                        {item.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="ml-3 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      × {item.quantity}
                    </p>

                    <p className="text-xs text-gray-500">
                      ₹{(item.basePrice + (item.modifierTotal || 0)).toFixed(2)}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* BILL BUTTON */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-3">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={
            processing ||
            billItems.length === 0
          }
          className="h-11 w-full rounded bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {processing ? 'PROCESSING...' : 'BILL'}
        </button>
      </div>

      {/* Calculations */}
      <div className="space-y-2 border-t border-gray-100 p-3 text-sm">

        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{calculation.itemSubtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>₹{calculation.itemTax.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Discount</span>
          <span>₹{calculation.discount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>₹{calculation.deliveryFee.toFixed(2)}</span>
        </div>

        <div className="border-t pt-2 flex justify-between text-base font-semibold text-gray-900">
          <span>Grand Total</span>
          <span>₹{calculation.grandTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-red-600">
          <span>Due</span>
          <span>₹{dueAmount.toFixed(2)}</span>
        </div>

      </div>

      {/* Inputs */}
      <div className="space-y-2 border-t border-gray-100 p-3">

        <input
          value={customerPhone}
          onChange={(e) =>
            setCustomerPhone(e.target.value)
          }
          placeholder="Phone"
          className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
        />

        <input
          type="number"
          value={paidAmount}
          onChange={(e) =>
            setPaidAmount(Number(e.target.value))
          }
          placeholder="Paid amount"
          className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
        />

      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

    </div>
  );
}