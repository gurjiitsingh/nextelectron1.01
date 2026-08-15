'use client';

import { useEffect, useMemo, useState } from 'react';

import { groupBillItems } from '@/lib/billing/calculateBill';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { fromPaise } from '@/lib/pos/billing/money';
import { calculateBillAndroid } from '@/lib/pos/billing/calculator';
import { Button } from '@/components/ui/button';
import { POS_THEME } from '@/style/posTheme';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
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




  const { billDraft, setBillDraft } = usePosSession();

  const discount = billDraft.discount;
  const discountPercent = billDraft.discountPercent;
  const deliveryFee = billDraft.deliveryFee;
  const customerName = billDraft.customerName;
  const customerPhone = billDraft.customerPhone;
  const paidAmount = billDraft.paidAmount;
  const paymentMode = billDraft.paymentMode;





  // const [paymentMode, setPaymentMode] =
  //   useState<'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'CREDIT'>('CASH');



  // =====================================================
  // GROUP BILL ITEMS (MERGED QTY)
  // =====================================================
  const billItems = useMemo(
    () => groupBillItems(billRows),
    [billRows]
  );
  const { background } = usePosTheme();

  const calculation = useMemo(() => {
    const result = calculateBillAndroid({
      items: billItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: Number(i.quantity || 0),
        basePrice: Number(i.basePrice || 0),
        taxRate: Number(i.taxRate || 0),
        taxType:
          (i.taxType || 'exclusive') as
          | 'inclusive'
          | 'exclusive',
      })),

      taxMode: 'PER_ITEM',

      discountFlat: discount,

      discountPercent,

      deliveryFee,

      deliveryTaxPercent: 0,
    });

    return {
      itemSubtotal: fromPaise(
        result.itemSubtotalPaise
      ),

      itemTax: fromPaise(
        result.totalTaxPaise
      ),

      discount: fromPaise(
        result.discountPaise
      ),

      deliveryFee: fromPaise(
        result.deliveryFeePaise
      ),

      deliveryTax: fromPaise(
        result.deliveryTaxPaise
      ),

      grandTotal: fromPaise(
        result.grandTotalPaise
      ),

      raw: result,
    };
  }, [billItems, discount, discountPercent, deliveryFee]);

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
      console.log('ANDROID CALCULATION', calculation.raw);

      console.log('DISPLAY TOTALS', {
        subtotal: calculation.itemSubtotal,
        tax: calculation.itemTax,
        discount: calculation.discount,
        delivery: calculation.deliveryFee,
        grandTotal: calculation.grandTotal,
      });
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

          deliveryTax:
            calculation.deliveryTax,

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

      setBillDraft({
        customerName: 'Customer',
        customerPhone: '',
        discount: 0,
        discountPercent: 0,
        deliveryFee: 0,
        paymentMode: 'CASH',
        paidAmount: 0,
      });

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

  async function previewBillImage() {
    if (billItems.length === 0) {
      alert('No items to preview');
      return;
    }

    console.log('PREVIEW BILL IMAGE CLICKED');

    try {
      const res = await window.posApi.previewBillImage({
        // =================================================
        // BILL INFORMATION
        // =================================================

        billNo: 'PREVIEW',
        orderNo: '',

        tableNo: currentTableId,
        tableName: currentTableName,

        orderType: 'DINE_IN',
        paymentMode,

        createdAt: Date.now(),

        // =================================================
        // ITEMS
        // =================================================

        items: billItems.map((i) => {
          const price =
            Number(i.basePrice || 0) +
            Number(i.modifierTotal || 0);

          const quantity =
            Number(i.quantity || 0);

          return {
            name: i.name,

            quantity,

            rate: price,

            amount: price * quantity,

            modifiers: [],
            // i.modifiers
            //   ? Array.isArray(i.modifiers)
            //     ? i.modifiers
            //     : [i.modifiers]
            //   : [],

            modifiersJson:
              i.modifiersJson || '',

            note:
              i.note || '',
          };
        }),

        // =================================================
        // TOTALS
        // =================================================

        subtotal:
          calculation.itemSubtotal,

        tax:
          calculation.itemTax,

        discount:
          calculation.discount,

        deliveryFee:
          calculation.deliveryFee,

        deliveryTax:
          calculation.deliveryTax,

        grandTotal:
          calculation.grandTotal,

        // =================================================
        // OUTLET
        // =================================================

        outletName: "kjl",
        addressLine1: "kjl",
        addressLine2: "kjl",
        addressLine3: "kjl",
        city: "kjl",
        phone: "kjl",
        phone2: "kjl",
        gstVatNumber: "kjl",

        // =================================================
        // TAX
        // =================================================

        taxMode: "EXCLUSIVE",
        taxType: "GST",
        countryCode: "IN",

        // =================================================
        // CUSTOMER
        // =================================================

        customerName,
        customerPhone,

        // =================================================
        // IMAGE PREVIEW OPTIONS
        // =================================================

        qrEnabled: true,

        upiId: "",

        qrTitle: 'SCAN & PAY',

        // =================================================
        // OTHER
        // =================================================

        stewardName: '',
        kotNumberText: '',
      });

      console.log(
        'BILL IMAGE PREVIEW RESULT:',
        res
      );

      if (!res?.success) {
        throw new Error(
          res?.error ||
          'Failed to generate bill preview'
        );
      }

      console.log(
        'PREVIEW FILE:',
        res.filePath
      );

      // Open generated PNG using Electron
      if (res.filePath) {
        window.posApi.openFile(res.filePath);
      }

    } catch (e) {

      console.error(
        'BILL IMAGE PREVIEW FAILED:',
        e
      );

      alert(
        'Preview failed: ' +
        (e?.message || 'Unknown error')
      );
    }
  }
  // =====================================================
  // PRINT BILL ONLY (NO SAVE)
  // =====================================================
  async function printBill() {
    if (billItems.length === 0) {
      alert('No items to print');
      return;
    }

    console.log('PRINT BILL CLICKED');

    try {
      const receiptData = {
        // =================================================
        // BILL INFORMATION
        // =================================================

        billNo: 'PREVIEW',
        orderNo: '',

        tableNo: currentTableId,
        tableName: currentTableName,

        orderType: 'DINE_IN',
        paymentMode,

        createdAt: Date.now(),

        // =================================================
        // ITEMS
        // =================================================

        items: billItems.map((i) => {
          const price =
            Number(i.basePrice || 0) +
            Number(i.modifierTotal || 0);

          const quantity =
            Number(i.quantity || 0);

          return {
            name: i.name,
            quantity,
            price,
            subtotal: price * quantity,

            modifiersJson:
              i.modifiersJson || '',

            note:
              i.note || '',
          };
        }),

        // =================================================
        // CALCULATED VALUES
        // SINGLE SOURCE OF TRUTH
        // =================================================

        subtotal:
          calculation.itemSubtotal,

        tax:
          calculation.itemTax,

        discount:
          calculation.discount,

        deliveryFee:
          calculation.deliveryFee,

        deliveryTax:
          calculation.deliveryTax,

        grandTotal:
          calculation.grandTotal,

        // =================================================
        // CUSTOMER
        // =================================================

        customerName,
        customerPhone,

        // =================================================
        // OPTIONAL ANDROID-STYLE INFORMATION
        // =================================================

        kotNumberText: '',
        stewardName: '',
      };

      const res =
        await window.posApi.print({
          role: 'BILL',
          source: 'POS',
          data: receiptData,
        });

      console.log('PRINT RESULT', res);

      if (!res.success) {
        throw new Error(
          res.error || 'Print failed'
        );
      }

      console.log(
        'BILL PRINTED SUCCESSFULLY'
      );

    } catch (e: any) {
      console.error(
        'PRINT FAILED',
        e
      );

      alert(
        'Print failed: ' +
        (e?.message || 'Unknown error')
      );
    }
  }

  return (
    <div className="flex h-full flex-col posBackground ">

      {/* Header */}
      <div
        className={`
    shrink-0
    w-full
    border-b
    ${background.border}
    px-4
    py-2
    flex
    items-center
    justify-between
  `}
      >
        <div className="text-sm ">
          {currentTableName}
        </div>

        <div className="text-sm">
          {billItems.length} items
        </div>
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

            {/* Item List */}
            <div className="min-h-0 flex-1 overflow-y-auto app-scrollbar">

              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm opacity-60">
                    Loading...
                  </p>
                </div>
              ) : billItems.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm opacity-60">
                    No bill items
                  </p>
                </div>
              ) : (
                <div className={`divide-y ${background.divide}`}>

                  {billItems.map((item) => (
                    <div
                      key={item.name}
                      className={`
            px-3
            py-3
            border-b
            ${background.border}
          `}
                    >

                      <div className="flex items-center justify-between">

                        {/* ITEM NAME */}
                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>

                          {item.note ? (
                            <p className="truncate text-xs opacity-60">
                              {item.note}
                            </p>
                          ) : null}

                        </div>

                        {/* QTY + PRICE */}
                        <div className="ml-3 text-right opacity-60">


                          {item.quantity}

                        </div>

                        {/* QTY + PRICE */}
                        <div className="ml-3 text-right">



                          <p className="text-xs opacity-60">
                            ₹{(
                              item.basePrice +
                              (item.modifierTotal || 0)
                            ).toFixed(2)}
                          </p>

                        </div>

                        <div className="ml-3 text-right">



                          <p className="text-xs opacity-90">
                            ₹{(
                              (item.basePrice +
                                (item.modifierTotal || 0)) * item.quantity
                            ).toFixed(2)}
                          </p>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* BILL BUTTON */}
      <div className="shrink-0   px-2">
        <div className="grid grid-cols-3 gap-2">

          {/* PRINT ONLY */}
          <button
            type="button"
            onClick={printBill}
            className={`h-8 rounded text-sm font-semibold ${POS_THEME.BillButton}`}
          >
            PRINT
          </button>

          {/* SAVE BILL */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={
              processing ||
              billItems.length === 0
            }
            className={`h-8 rounded text-sm font-semibold ${POS_THEME.BillButton}`}    >
            {processing ? 'PROCESSING...' : 'BILL'}
          </button>



          <button
            type="button"
            onClick={previewBillImage}
            className={`h-8 rounded text-sm font-semibold ${POS_THEME.BillButton}`}
          >
            Preview
          </button>

        </div>
      </div>

      {/* Calculations */}
      <div className="space-y-2  p-3 text-sm">

        <div className="flex justify-between ">
          <span>Subtotal</span>
          <span>₹{calculation.itemSubtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between ">
          <span>Tax</span>
          <span>₹{calculation.itemTax.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Discount</span>

            {/* Flat discount */}
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;

                setBillDraft({
                  ...billDraft,
                  discount: value,
                  discountPercent: value > 0 ? 0 : billDraft.discountPercent,
                });
              }}
              placeholder="₹"
              className="h-8 w-16 rounded border border-gray-300 px-2 text-right text-sm outline-none focus:border-blue-500"
            />

            {/* Percent discount */}
            <div className="flex items-center rounded border border-gray-300 focus-within:border-blue-500">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercent}
                onChange={(e) => {
                  const value = Number(e.target.value) || 0;

                  setBillDraft({
                    ...billDraft,
                    discountPercent: value,
                    discount: value > 0 ? 0 : billDraft.discount,
                  });
                }}
                placeholder="%"
                className="h-8 w-14 px-2 text-right text-sm outline-none"
              />

              <span className="pr-2 text-xs text-gray-500">%</span>
            </div>
          </div>

          <span className="font-medium text-gray-900">
            ₹{calculation.discount.toFixed(2)}
          </span>
        </div>

        {/* Delivery */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Delivery</span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(e) =>
                setBillDraft({
                  ...billDraft,
                  deliveryFee: Number(e.target.value) || 0,
                })
              }
              placeholder="₹"
              className="h-8 w-20 rounded border border-gray-300 px-2 text-right text-sm outline-none focus:border-blue-500"
            />
          </div>

          <span className="font-medium text-gray-900">
            ₹{calculation.deliveryFee.toFixed(2)}
          </span>
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
      {/* <div className="space-y-2 border-t border-gray-100 p-3">

    <input
      value={customerPhone}
      onChange={(e) =>
        setBillDraft({
          ...billDraft,
          customerPhone: e.target.value,
        })
      }
      placeholder="Phone"
      className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
    />

    <input
      type="number"
      value={paidAmount}
      onChange={(e) =>
        setBillDraft({
          ...billDraft,
          paidAmount: Number(e.target.value) || 0,
        })
      }
      placeholder="Paid amount"
      className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
    />

    <input
  value={customerName}
  onChange={(e) =>
    setBillDraft({
      ...billDraft,
      customerName: e.target.value,
    })
  }
  placeholder="Customer name"
  className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
/>

  </div> */}

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

    </div>
  );
}