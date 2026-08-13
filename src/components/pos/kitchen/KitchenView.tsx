'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/store/CartContext';
import { calculateBill, groupBillItems } from '@/lib/billing/calculateBill';
import { usePosUi } from '@/PosUiStore/PosUiContext';



type KitchenViewProps = {
  onSuccess?: () => void;
};

export default function KitchenView({
  onSuccess,
}: KitchenViewProps) {
  const { tableNo } = useCartContext();

  const router = useRouter();

  const [kitchenItems, setKitchenItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // LOAD KITCHEN ITEMS FOR CURRENT TABLE
  // =====================================================
  useEffect(() => {
    loadKitchen();
  }, [tableNo]);

  async function loadKitchen() {
    if (!tableNo) return;

    try {
      setLoading(true);

      const rows =
        await window.posApi.getPendingKotByTable(
          tableNo
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

  const [processing, setProcessing] = useState(false);

  const [error, setError] =
    useState<string | null>(null);


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

    // if (billItems.length === 0) {
    //     setError(
    //         'No kitchen items available for billing.'
    //     );
    //     return;
    // }

    // if (
    //     (paymentStatus === 'CREDIT' ||
    //         paymentStatus === 'PARTIAL') &&
    //     !customerPhone.trim()
    // ) {
    //     setError(
    //         'Phone number is required for credit sale.'
    //     );
    //     return;
    // }

    // if (
    //     Number(paidAmount) >
    //     calculation.grandTotal
    // ) {
    //     setError(
    //         'Paid amount cannot be greater than total.'
    //     );
    //     return;
    // }

    try {
      setProcessing(true);
      setError(null);

      /*
       * FINAL BILL IPC WILL BE CONNECTED HERE.
       * We will implement this after creating
       * the Electron billing repository/IPC.
       */

      const result =
        await window.posApi.createBill({
          tableNo: "T1",

          orderType: "DINE_IN",

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

      // clear UI immediately
      setKitchenItems([]);

      // reload from database so state stays correct
      await loadKitchen();


      setRightSidebarView('cart')
      // alert(
      //     `Bill ${result.srno} created successfully`
      // );

      // optional parent refresh
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



  return (
    <div className="flex h-full flex-col bg-white mb-16">

      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 px-4 py-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Kitchen Orders
          </h2>

          <span className="text-sm text-gray-500">
            {kitchenItems.length} items
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          Table: {tableNo ?? 'N/A'}
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
        ) : kitchenItems.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              No kitchen items
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">

            {kitchenItems.map((item) => (
              <div
                key={item.id}
                className="px-3 py-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">
                    {item.kotNumber}
                  </span>

                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-800">
                    {item.status}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-900">
                  {item.quantity} × {item.name}
                </p>

                {item.note ? (
                  <p className="mt-1 text-xs text-gray-500">
                    {item.note}
                  </p>
                ) : null}

                <p className="mt-1 text-[11px] text-gray-400">
                  Table {item.tableNo}
                </p>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* Centered BILL button */}
      <div className="shrink-0 flex  border-t border-gray-200 bg-gray-50">

        <button
          type="button"
          onClick={handleCheckout}
          disabled={
            loading ||
            kitchenItems.length === 0
          }
          className="h-11 w-44   bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          BILL
        </button>

      </div>

      {/* Calculations section */}
      <div className="space-y-2 text-sm">

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

      <input
        value={customerPhone}
        onChange={(e) =>
          setCustomerPhone(e.target.value)
        }
        placeholder="Phone"
      />

      <input
        type="number"
        value={paidAmount}
        onChange={(e) =>
          setPaidAmount(Number(e.target.value))
        }
        placeholder="Paid amount"
      />

    </div>
  );
}





