'use client';

import { useEffect, useMemo, useState } from 'react';

import { groupBillItems } from '@/lib/billing/calculateBill';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { fromPaise } from '@/lib/pos/billing/money';
import { calculateBillAndroid } from '@/lib/pos/billing/calculator';
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

  // =====================================================
  // POS THEME
  // =====================================================

  const {
    background,
  } = usePosTheme();

  // =====================================================
  // LOAD BILL ITEMS
  // =====================================================

  useEffect(() => {
    loadBillItems();
  }, [currentTableId]);

  async function loadBillItems() {
    if (!currentTableId) return;

    try {
      setLoading(true);

      console.log(
        'LOAD BILL ITEMS',
        currentTableId
      );

      const rows =
        await window.posApi.getBillItems(
          currentTableId
        );

      console.log(
        'BILL ROWS',
        rows
      );

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

  const {
    billDraft,
    setBillDraft,
  } = usePosSession();

  const discount =
    billDraft.discount;

  const discountPercent =
    billDraft.discountPercent;

  const deliveryFee =
    billDraft.deliveryFee;

  const customerName =
    billDraft.customerName;

  const customerPhone =
    billDraft.customerPhone;

  const paidAmount =
    billDraft.paidAmount;

  const paymentMode =
    billDraft.paymentMode;

  // =====================================================
  // GROUP BILL ITEMS
  // =====================================================

  const billItems = useMemo(
    () =>
      groupBillItems(billRows),
    [billRows]
  );

  // =====================================================
  // BILL CALCULATION
  // =====================================================

  const calculation = useMemo(() => {

    const result =
      calculateBillAndroid({

        items: billItems.map((i) => ({
          productId:
            i.productId,

          name:
            i.name,

          quantity:
            Number(
              i.quantity || 0
            ),

          basePrice:
            Number(
              i.basePrice || 0
            ),

          taxRate:
            Number(
              i.taxRate || 0
            ),

          taxType:
            (i.taxType ||
              'exclusive') as
            | 'inclusive'
            | 'exclusive',
        })),

        taxMode:
          'PER_ITEM',

        discountFlat:
          discount,

        discountPercent,

        deliveryFee,

        deliveryTaxPercent:
          0,
      });

    return {

      itemSubtotal:
        fromPaise(
          result.itemSubtotalPaise
        ),

      itemTax:
        fromPaise(
          result.totalTaxPaise
        ),

      discount:
        fromPaise(
          result.discountPaise
        ),

      deliveryFee:
        fromPaise(
          result.deliveryFeePaise
        ),

      deliveryTax:
        fromPaise(
          result.deliveryTaxPaise
        ),

      grandTotal:
        fromPaise(
          result.grandTotalPaise
        ),

      raw:
        result,
    };

  }, [
    billItems,
    discount,
    discountPercent,
    deliveryFee,
  ]);

  // =====================================================
  // PAYMENT
  // =====================================================

  const dueAmount =
    Math.max(
      0,
      calculation.grandTotal -
      Number(
        paidAmount || 0
      )
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

async function handleCheckout(
  selectedPaymentMode: 'CASH' | 'CARD' | 'UPI'
) {
  if (processing) return;

  if (billItems.length === 0) {
    setError('No items in bill');
    return;
  }

  try {
    setProcessing(true);
    setError(null);

    const totalAmount = Number(
      calculation.grandTotal
    ) || 0;

    console.log(
      'CHECKOUT PAYMENT MODE:',
      selectedPaymentMode
    );

    console.log(
      'CHECKOUT AMOUNT:',
      totalAmount
    );
console.log("tableName--------------", currentTableName)
    const result =
      await window.posApi.createBill({

        tableNo:
          currentTableId,
           tableName:
          currentTableName,

        orderType:
          'DINE_IN',

        customerName:
          customerName.trim() ||
          'Customer',

        customerPhone:
          customerPhone.trim(),

        discountTotal:
          calculation.discount,

        deliveryFee:
          calculation.deliveryFee,

        deliveryTax:
          calculation.deliveryTax,

        // =============================================
        // PAYMENT
        // =============================================

        paymentMode:
          selectedPaymentMode,

        paymentStatus:
          'PAID',

        paidAmount:
          totalAmount,

        payments: [
          {
            mode:
              selectedPaymentMode,

            amount:
              totalAmount,
          },
        ],

        // =============================================
        // DEVICE
        // =============================================

        deviceId:
          'POS',

        deviceName:
          'Electron POS',

        appVersion:
          '1.0',

        businessDate:
          new Date()
            .toISOString()
            .slice(0, 10),

        currency:
          '₹',
      });

    if (!result.success) {
      throw new Error(
        result.error ||
        'Failed to create bill'
      );
    }

    // ===============================================
    // RESET BILL DRAFT
    // ===============================================

    setBillDraft({

      customerName:
        'Customer',

      customerPhone:
        '',

      discount:
        0,

      discountPercent:
        0,

      deliveryFee:
        0,

      paymentMode:
        'CASH',

      paidAmount:
        0,
    });

    console.log(
      'BILL CREATED SUCCESSFULLY',
      {
        paymentMode:
          selectedPaymentMode,

        paidAmount:
          totalAmount,

        result,
      }
    );

    // ===============================================
    // CLEAR BILL
    // ===============================================

    setBillRows([]);

    await loadBillItems();

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
  // PREVIEW BILL IMAGE
  // =====================================================

  async function previewBillImage() {

    if (billItems.length === 0) {

      alert(
        'No items to preview'
      );

      return;
    }

    console.log(
      'PREVIEW BILL IMAGE CLICKED'
    );

    try {

      const res =
        await window.posApi.previewBillImage({

          billNo:
            'PREVIEW',

          orderNo:
            '',

          tableNo:
            currentTableId,

          tableName:
            currentTableName,

          orderType:
            'DINE_IN',

          paymentMode,

          createdAt:
            Date.now(),

          items:
            billItems.map((i) => {

              const price =
                Number(
                  i.basePrice || 0
                ) +
                Number(
                  i.modifierTotal || 0
                );

              const quantity =
                Number(
                  i.quantity || 0
                );

              return {

                name:
                  i.name,

                quantity,

                rate:
                  price,

                amount:
                  price * quantity,

                modifiers:
                  [],

                modifiersJson:
                  i.modifiersJson ||
                  '',

                note:
                  i.note || '',
              };
            }),

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

          outletName:
            'kjl',

          addressLine1:
            'kjl',

          addressLine2:
            'kjl',

          addressLine3:
            'kjl',

          city:
            'kjl',

          phone:
            'kjl',

          phone2:
            'kjl',

          gstVatNumber:
            'kjl',

          taxMode:
            'EXCLUSIVE',

          taxType:
            'GST',

          countryCode:
            'IN',

          customerName,

          customerPhone,

          qrEnabled:
            true,

          upiId:
            '',

          qrTitle:
            'SCAN & PAY',

          stewardName:
            '',

          kotNumberText:
            '',
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

      if (res.filePath) {

        window.posApi.openFile(
          res.filePath
        );
      }

    } catch (e: any) {

      console.error(
        'BILL IMAGE PREVIEW FAILED:',
        e
      );

      alert(
        'Preview failed: ' +
        (
          e?.message ||
          'Unknown error'
        )
      );
    }
  }

  // =====================================================
  // PRINT BILL ONLY
  // =====================================================

  async function printBill() {

    if (billItems.length === 0) {

      alert(
        'No items to print'
      );

      return;
    }

    console.log(
      'PRINT BILL CLICKED'
    );

    try {

      const receiptData = {

        billNo:
          'PREVIEW',

        orderNo:
          '',

        tableNo:
          currentTableId,

        tableName:
          currentTableName,

        orderType:
          'DINE_IN',

        paymentMode,

        createdAt:
          Date.now(),

        items:
          billItems.map((i) => {

            const price =
              Number(
                i.basePrice || 0
              ) +
              Number(
                i.modifierTotal || 0
              );

            const quantity =
              Number(
                i.quantity || 0
              );

            return {

              name:
                i.name,

              quantity,

              price,

              subtotal:
                price * quantity,

              modifiersJson:
                i.modifiersJson ||
                '',

              note:
                i.note || '',
            };
          }),

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

        customerName,

        customerPhone,

        kotNumberText:
          '',

        stewardName:
          '',
      };

      const res =
        await window.posApi.print({

          role:
            'BILL',

          source:
            'POS',

          data:
            receiptData,
        });

      console.log(
        'PRINT RESULT',
        res
      );

      if (!res.success) {

        throw new Error(
          res.error ||
          'Print failed'
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
        (
          e?.message ||
          'Unknown error'
        )
      );
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
        ${background.className}
        ${background.text}
      `}
    >

      {/* =================================================
          HEADER
      ================================================= */}

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

        <div className="text-sm opacity-80">
          {currentTableName}
        </div>

        <div className="text-sm opacity-60">
          {billItems.length} items
        </div>

      </div>


      {/* =================================================
          ITEM LIST
      ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          app-scrollbar
        "
      >

        {loading ? (

          <div className="flex h-full items-center justify-center">

            <p className="text-sm opacity-50">
              Loading...
            </p>

          </div>

        ) : billItems.length === 0 ? (

          <div className="flex h-full items-center justify-center">

            <p className="text-sm opacity-50">
              No bill items
            </p>

          </div>

        ) : (

          <div
            className={`
              divide-y
              ${background.divide}
            `}
          >

            {billItems.map((item) => (

              <div
                key={item.name}
                className="
                  px-3
                  py-3
                "
              >

                <div className="flex items-center justify-between">

                  {/* ITEM NAME */}

                  <div className="min-w-0 flex-1">

                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        opacity-80
                      "
                    >
                      {item.name}
                    </p>

                    {item.note ? (

                      <p
                        className="
                          truncate
                          text-xs
                          opacity-45
                        "
                      >
                        {item.note}
                      </p>

                    ) : null}

                  </div>


                  {/* QTY */}

                  <div
                    className="
                      ml-3
                      min-w-[24px]
                      text-right
                      text-sm
                      opacity-55
                    "
                  >
                    {item.quantity}
                  </div>


                  {/* UNIT PRICE */}

                  <div
                    className="
                      ml-3
                      min-w-[65px]
                      text-right
                    "
                  >

                    <p className="text-xs opacity-50">

                      ₹
                      {(
                        item.basePrice +
                        (
                          item.modifierTotal ||
                          0
                        )
                      ).toFixed(2)}

                    </p>

                  </div>


                  {/* TOTAL */}

                  <div
                    className="
                      ml-3
                      min-w-[75px]
                      text-right
                    "
                  >

                    <p className="text-xs opacity-80">

                      ₹
                      {(
                        (
                          item.basePrice +
                          (
                            item.modifierTotal ||
                            0
                          )
                        ) *
                        item.quantity
                      ).toFixed(2)}

                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =================================================
          BILL BUTTONS
      ================================================= */}

     <div className="shrink-0 px-2 pt-2">

  <div className="flex items-center gap-2">

    {/* =============================================
        PRINT
    ============================================= */}

    <button
      type="button"
      onClick={printBill}
      className={`
        h-8
        w-fit
        px-3
        rounded
        text-xs
        font-semibold
        ${POS_THEME.BillButton}
      `}
    >
      PRINT
    </button>


    {/* =============================================
        CASH
    ============================================= */}

    <button
      type="button"
      onClick={() =>
        handleCheckout('CASH')
      }
      disabled={
        processing ||
        billItems.length === 0
      }
      className="
        h-8
        w-fit
        px-3
        rounded-md
        text-xs
        font-semibold
        text-white
        bg-green-600
        hover:bg-green-700
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      {processing
        ? 'PROCESSING...'
        : 'CASH'}
    </button>


    {/* =============================================
        CARD
    ============================================= */}

    <button
      type="button"
      onClick={() =>
        handleCheckout('CARD')
      }
      disabled={
        processing ||
        billItems.length === 0
      }
      className="
        h-8
        w-fit
        px-3
        rounded-md
        text-xs
        font-semibold
        text-white
        bg-blue-600
        hover:bg-blue-700
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      CARD
    </button>


    {/* =============================================
        UPI
    ============================================= */}

    <button
      type="button"
      onClick={() =>
        handleCheckout('UPI')
      }
      disabled={
        processing ||
        billItems.length === 0
      }
      className="
        h-8
        w-fit
        px-3
        rounded-md
        text-xs
        font-semibold
        text-white
        bg-purple-600
        hover:bg-purple-700
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      UPI
    </button>

  </div>

</div>


      {/* =================================================
          CALCULATIONS   border-t
          ${background.border}
      ================================================= */}

      <div
        className={`
          space-y-2
        
          p-3
          text-sm
        `}
      >

        {/* SUBTOTAL */}

        <div
          className="
            flex
            justify-between
            opacity-70
          "
        >
          <span>
            Subtotal
          </span>

          <span>
            ₹
            {calculation.itemSubtotal.toFixed(2)}
          </span>
        </div>


        {/* TAX */}

        <div
          className="
            flex
            justify-between
            opacity-65
          "
        >
          <span>
            Tax
          </span>

          <span>
            ₹
            {calculation.itemTax.toFixed(2)}
          </span>
        </div>


        {/* DISCOUNT */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span className="opacity-60">
              Discount
            </span>


            {/* FLAT DISCOUNT */}

            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => {

                const value =
                  Number(
                    e.target.value
                  ) || 0;

                setBillDraft({

                  ...billDraft,

                  discount:
                    value,

                  discountPercent:
                    value > 0
                      ? 0
                      : billDraft.discountPercent,
                });

              }}
              placeholder="₹"
              className={`
                h-8
                w-16
                rounded
                border
                ${background.border}
                ${background.text}
                px-2
                text-right
                text-sm
                opacity-80
                outline-none
                focus:opacity-100
              `}
            />


            {/* PERCENT DISCOUNT */}

            <div
              className={`
                flex
                items-center
                rounded
                border
                ${background.border}
              `}
            >

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercent}
                onChange={(e) => {

                  const value =
                    Number(
                      e.target.value
                    ) || 0;

                  setBillDraft({

                    ...billDraft,

                    discountPercent:
                      value,

                    discount:
                      value > 0
                        ? 0
                        : billDraft.discount,
                  });

                }}
                placeholder="%"
                className={`
                  h-8
                  w-14
                  bg-transparent
                  px-2
                  text-right
                  text-sm
                  opacity-80
                  outline-none
                `}
              />

              <span
                className="
                  pr-2
                  text-xs
                  opacity-50
                "
              >
                %
              </span>

            </div>

          </div>


          <span
            className="
              font-medium
              opacity-75
            "
          >
            ₹
            {calculation.discount.toFixed(2)}
          </span>

        </div>


        {/* DELIVERY */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span className="opacity-60">
              Delivery
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(e) =>
                setBillDraft({

                  ...billDraft,

                  deliveryFee:
                    Number(
                      e.target.value
                    ) || 0,
                })
              }
              placeholder="₹"
              className={`
                h-8
                w-20
                rounded
                border
                ${background.border}
                ${background.text}
                px-2
                text-right
                text-sm
                opacity-80
                outline-none
                focus:opacity-100
              `}
            />

          </div>

          <span
            className="
              font-medium
              opacity-75
            "
          >
            ₹
            {calculation.deliveryFee.toFixed(2)}
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
        >

          <span className="opacity-85">
            Grand Total
          </span>

          <span className="opacity-90">
            ₹
            {calculation.grandTotal.toFixed(2)}
          </span>

        </div>


        {/* DUE */}

        {/* <div
          className="
            flex
            justify-between
            text-sm
            text-red-500
            opacity-80
          "
        >

          <span>
            Due
          </span>

          <span>
            ₹
            {dueAmount.toFixed(2)}
          </span>

        </div> */}

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="
            border-t
            border-red-500/20
            bg-red-500/5
            px-3
            py-2
            text-sm
            text-red-500
          "
        >
          {error}
        </div>

      )}

    </div>
  );
}