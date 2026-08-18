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

      const rows =
        await window.posApi.getBillItems(
          currentTableId
        );

      console.log("bill items----------------------", rows)

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
// UPDATE BILL ITEM QUANTITY
// =====================================================

async function updateBillItemQuantity(
  item: any,
  newQuantity: number
) {
  if (!item?.productId) {
    return;
  }

  try {
    setProcessing(true);
    setError(null);

    console.log(
      'UPDATE BILL ITEM:',
      {
        productId: item.productId,
        quantity: newQuantity,
        tableNo: currentTableId,
      }
    );

    // Quantity cannot go below zero
    const quantity = Math.max(
      0,
      Number(newQuantity)
    );

    // =============================================
    // DELETE ITEM
    // =============================================

    if (quantity <= 0) {

      const result =
        await window.posApi.deleteBillItem({
          tableNo:
            currentTableId,

          productId:
            item.productId,

          // Important when modifiers/variants
          // are present
          modifiersJson:
            item.modifiersJson || '',

          note:
            item.note || '',
        });

      if (!result?.success) {
        throw new Error(
          result?.error ||
          'Failed to remove item'
        );
      }

    }

    // =============================================
    // UPDATE QUANTITY
    // =============================================

    else {

      const result =
        await window.posApi.updateBillItemQuantity({
          tableNo:
            currentTableId,

          productId:
            item.productId,

          modifiersJson:
            item.modifiersJson || '',

          note:
            item.note || '',

          quantity,
        });

      if (!result?.success) {
        throw new Error(
          result?.error ||
          'Failed to update item quantity'
        );
      }
    }

    // =============================================
    // RELOAD
    // =============================================

    await loadBillItems();

  } catch (e) {

    console.error(
      'FAILED TO UPDATE BILL ITEM:',
      e
    );

    const message =
      e instanceof Error
        ? e.message
        : String(e);

    setError(
      message ||
      'Failed to update item'
    );

  } finally {

    setProcessing(false);
  }
}


// =====================================================
// DECREASE
// =====================================================

async function decreaseBillItem(item: any) {
  const currentQuantity =
    Number(item.quantity || 0);

  const newQuantity =
    currentQuantity - 1;

  await updateBillItemQuantity(
    item,
    newQuantity
  );
}


// =====================================================
// INCREASE
// =====================================================

async function increaseBillItem(item: any) {
  const currentQuantity =
    Number(item.quantity || 0);

  const newQuantity =
    currentQuantity + 1;

  await updateBillItemQuantity(
    item,
    newQuantity
  );
}  


async function updateBillItemQuantity(
  item: any,
  quantity: number
) {
  try {
    const result =
      await window.posApi.updateBillItemQuantity({
        tableNo: currentTableId,

        billItemGroupKey:
          item.billItemGroupKey,

        quantity,
      });

    if (!result.success) {
      throw new Error(
        result.error ||
        'Failed to update bill item'
      );
    }

    // Reload bill rows so:
    // quantity
    // subtotal
    // tax
    // grand total
    // all update immediately

    await loadBillItems();

  } catch (e) {
    console.error(
      'UPDATE BILL ITEM FAILED:',
      e
    );

    setError(
      e instanceof Error
        ? e.message
        : 'Failed to update bill item'
    );
  }
}
  // =====================================================
  // FINALIZE BILL
  // =====================================================

  async function handleCheckout(
    selectedPaymentMode:
      'CASH'
      | 'CARD'
      | 'UPI'
  ) {

    if (processing) {
      return;
    }


    if (billItems.length === 0) {

      setError(
        'No items in bill'
      );

      return;
    }


    if (!currentTableId) {

      setError(
        'No table selected'
      );

      return;
    }


    try {

      setProcessing(true);

      setError(null);


      // =================================================
      // 1. CALCULATE FINAL TOTAL
      // =================================================

      const totalAmount =
        Number(
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


      console.log(
        'CHECKOUT TABLE:',
        currentTableId
      );


      console.log(
        'FINAL BILL ITEMS:',
        billItems
      );


      // =================================================
      // 2. CREATE BILL
      // =================================================

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


          // =============================================
          // DATE
          // =============================================

          businessDate:
            new Date()
              .toISOString()
              .slice(0, 10),


          currency:
            '₹',
        });


      // =================================================
      // 3. CHECK BILL RESULT
      // =================================================

      if (!result.success) {

        throw new Error(
          result.error ||
          'Failed to create bill'
        );
      }


      console.log(
        'BILL CREATED:',
        result
      );


      // =================================================
      // 4. MARK KOT HISTORY
      //
      // IMPORTANT:
      //
      // We do NOT provide kotHistoryId.
      //
      // Repository finds all KOT histories
      // belonging to currentTableId.
      //
      // ================================================

      const kotResult =
        await window.posApi.markTableHistoryPaid({

          tableNo:
            currentTableId,

          billItems:
            billItems,

          orderId:
            result.srno || "",


        });




      if (!kotResult.success) {

        throw new Error(
          kotResult.error ||
          'Failed to update KOT history'
        );
      }


      // =================================================
      // 5. RESET BILL DRAFT
      // =================================================

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


      // =================================================
      // 6. CLEAR BILL UI
      // =================================================

      setBillRows([]);


      // =================================================
      // 7. RELOAD BILL ITEMS
      // =================================================

      await loadBillItems();


      // =================================================
      // 8. SUCCESS CALLBACK
      // =================================================

      onSuccess?.();


    } catch (e) {

      console.error(
        'BILL FAILED',
        e
      );


      const message =
        e instanceof Error
          ? e.message
          : String(e);


      setError(
        message ||
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
      py-2
    "
  >

    <div className="flex items-center">

      {/* ========================================= */}
      {/* ITEM NAME */}
      {/* ========================================= */}

      <div className="min-w-0 flex-1">

        <p
          className="
            truncate
            text-[11px]
            font-medium
            leading-tight
            opacity-80
          "
        >
          {item.name}
        </p>

        {item.note ? (

          <p
            className="
              mt-0.5
              truncate
              text-[10px]
              leading-tight
              opacity-40
            "
          >
            {item.note}
          </p>

        ) : null}

      </div>


      {/* ========================================= */}
      {/* QTY CONTROLS */}
      {/* ========================================= */}

      <div
        className="
          ml-2
          flex
          shrink-0
          items-center
          gap-0.5
        "
      >

        {/* DECREASE */}

{/* DECREASE */}

<button
  type="button"
  disabled={processing}
  className="
    flex
    h-5
    w-5
    items-center
    justify-center
    rounded
    border
    text-[12px]
    font-medium
    opacity-65
    transition
    hover:opacity-100
    active:scale-95
    disabled:cursor-not-allowed
    disabled:opacity-30
  "
  onClick={() =>
    decreaseBillItem(item)
  }
>
  −
</button>


{/* QUANTITY */}

<div
  className="
    flex
    min-w-[22px]
    justify-center
    text-[11px]
    font-medium
  "
>
  {item.quantity}
</div>


{/* INCREASE */}

<button
  type="button"
  disabled={processing}
  className="
    flex
    h-5
    w-5
    items-center
    justify-center
    rounded
    border
    text-[12px]
    font-medium
    opacity-65
    transition
    hover:opacity-100
    active:scale-95
    disabled:cursor-not-allowed
    disabled:opacity-30
  "
  onClick={() =>
    increaseBillItem(item)
  }
>
  +
</button>

      </div>


      {/* ========================================= */}
      {/* PRICE / TOTAL */}
      {/* ========================================= */}

      <div
        className="
          ml-3
          min-w-[70px]
          shrink-0
          text-right
        "
      >

        {/* TOTAL */}

        <p
          className="
            text-[12px]
            font-semibold
            leading-tight
            tabular-nums
            opacity-80
          "
        >
          ₹
          {(
            (
              item.basePrice +
              (
                item.modifierTotal || 0
              )
            ) *
            item.quantity
          ).toFixed(2)}
        </p>


        {/* UNIT PRICE */}

        <p
          className="
            mt-0.5
            text-[9px]
            leading-tight
            tabular-nums
            opacity-60
          "
        >
          ₹
          {(
            item.basePrice +
            (
              item.modifierTotal || 0
            )
          ).toFixed(2)}
          {" / item"}
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

      <div className="shrink-0 px-2  bg-zinc-800 py-1">

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
    space-y-1
    px-3
    py-2
    text-[12px]
  `}
>
  {/* =====================================================
      SUBTOTAL
  ===================================================== */}

  <div
    className="
      flex
      items-center
      justify-between
      py-0.5
    "
  >
    <span className="opacity-55">
      Subtotal
    </span>

    <span className="font-medium opacity-75">
      ₹{calculation.itemSubtotal.toFixed(2)}
    </span>
  </div>


  {/* =====================================================
      TAX
  ===================================================== */}

  <div
    className="
      flex
      items-center
      justify-between
      py-0.5
    "
  >
    <span className="opacity-55">
      Tax
    </span>

    <span className="font-medium opacity-70">
      ₹{calculation.itemTax.toFixed(2)}
    </span>
  </div>


  {/* =====================================================
      DISCOUNT
  ===================================================== */}

  <div
    className="
      flex
      items-center
      justify-between
      gap-2
      py-1
    "
  >

    {/* LEFT */}

    <div
      className="
        flex
        min-w-0
        items-center
        gap-2
      "
    >

      <span className="shrink-0 opacity-55">
        Discount
      </span>


      {/* FLAT */}

      <div
        className={`
          flex
          h-7
          w-[68px]
          items-center
          rounded
          border
          ${background.border}
          bg-black/[0.025]
        `}
      >

        <span className="pl-2 text-[10px] opacity-35">
          ₹
        </span>

    <input
  type="number"
  min="0"
  step="0.01"
  value={discount === 0 ? '' : discount}
  onChange={(e) => {

    const value =
      e.target.value === ''
        ? 0
        : Number(e.target.value);

    setBillDraft({

      ...billDraft,

      discount: value,

      discountPercent:
        value > 0
          ? 0
          : billDraft.discountPercent,

    });

  }}
  placeholder="0"
  className={`
    h-full
    w-full
    bg-transparent
    px-1
    text-right
    text-[11px]
    ${background.text}
    outline-none

    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `}
/>

      </div>


      {/* OR */}

      <span className="text-[9px] opacity-25">
        OR
      </span>


      {/* PERCENT */}

      <div
        className={`
          flex
          h-7
          w-[62px]
          items-center
          rounded
          border
          ${background.border}
          bg-black/[0.025]
        `}
      >

      <input
  type="number"
  min="0"
  max="100"
  step="0.01"
  value={
    discountPercent === 0
      ? ''
      : discountPercent
  }
  onChange={(e) => {

    const value =
      e.target.value === ''
        ? 0
        : Number(e.target.value);

    setBillDraft({

      ...billDraft,

      discountPercent: value,

      discount:
        value > 0
          ? 0
          : billDraft.discount,

    });

  }}
  placeholder="0"
  className={`
    h-full
    w-full
    bg-transparent
    px-1
    text-right
    text-[11px]
    ${background.text}
    outline-none

    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `}
/>

        <span className="pr-2 text-[10px] opacity-40">
          %
        </span>

      </div>

    </div>


    {/* CALCULATED DISCOUNT */}

    <span
      className="
        shrink-0
        font-medium
        opacity-70
      "
    >
      − ₹{calculation.discount.toFixed(2)}
    </span>

  </div>


  {/* =====================================================
      DELIVERY
  ===================================================== */}

  <div
    className="
      flex
      items-center
      justify-between
      gap-2
      py-1
    "
  >

    {/* LEFT */}

    <div
      className="
        flex
        items-center
        gap-2
      "
    >

      <span className="opacity-55">
        Delivery
      </span>


      <div
        className={`
          flex
          h-7
          w-[72px]
          items-center
          rounded
          border
          ${background.border}
          bg-black/[0.025]
        `}
      >

        <span className="pl-2 text-[10px] opacity-35">
          ₹
        </span>

    <input
  type="number"
  min="0"
  step="0.01"
  value={
    deliveryFee === 0
      ? ''
      : deliveryFee
  }
  onChange={(e) => {

    const value =
      e.target.value === ''
        ? 0
        : Number(e.target.value);

    setBillDraft({

      ...billDraft,

      deliveryFee:
        value,

    });

  }}
  placeholder="0"
  className={`
    h-full
    w-full
    bg-transparent
    px-1
    text-right
    text-[11px]
    ${background.text}
    outline-none

    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `}
/>

      </div>

    </div>


    {/* DELIVERY TOTAL */}

    <span
      className="
        shrink-0
        font-medium
        opacity-70
      "
    >
      ₹{calculation.deliveryFee.toFixed(2)}
    </span>

  </div>


  {/* =====================================================
      GRAND TOTAL
  ===================================================== */}

  <div
    className={`
      mt-1
      flex
      items-center
      justify-between
      border-t
      ${background.border}
      pt-2
    `}
  >

    <span
      className="
        text-[13px]
        font-semibold
        opacity-85
      "
    >
      Grand Total
    </span>

    <span
      className="
        text-[15px]
        font-bold
        opacity-95
      "
    >
      ₹{calculation.grandTotal.toFixed(2)}
    </span>

  </div>

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