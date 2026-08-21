'use client';

import { useEffect, useMemo, useState } from 'react';

import { groupBillItems } from '@/lib/billing/calculateBill';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { fromPaise } from '@/lib/pos/billing/money';
import { calculateBillAndroid } from '@/lib/pos/billing/calculator';
import { POS_THEME } from '@/style/posTheme';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import PaymentAllocation, { PaymentAllocationValue } from './PaymentAllocationValue';

type PaymentAllocationProps = {
  totalAmount: number;

  value: PaymentAllocationValue;

  onChange: (
    payment: PaymentAllocationValue
  ) => void;
};

type BillProps = {
  onSuccess?: () => void;
};

export default function Bill({
  onSuccess,
}: BillProps) {

const {
  activeTable,
  activeOrder,
} = usePosSession();

const isRunningOrder =
  !!activeOrder?.orderNo;

const currentTableId =
  activeOrder?.orderNo ||
  activeTable?.tableId ||
  activeTable?.tableName ||
  'T1';

const currentTableName =
  activeOrder?.orderNo ||
  activeTable?.tableName ||
  'N/A';

const currentOrderType =
  activeOrder?.orderType ||
  'DINE_IN';

  const [billRows, setBillRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPaymentSummary, setShowPaymentSummary] =
  useState(false);

  const [paymentAllocation, setPaymentAllocation] =
  useState<PaymentAllocationValue>({
    cash: 0,
    card: 0,
    upi: 0,
    credit: 0,
  });

  const [showComplimentaryMenu, setShowComplimentaryMenu] =
  useState(false);

const [complimentaryReason, setComplimentaryReason] =
  useState<string | null>(null);
const [showPaymentAllocation, setShowPaymentAllocation] =
  useState(false);
  

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
}, [
  currentTableId,
  currentOrderType,
]);

// =====================================================
// LOAD BILL ITEMS
// =====================================================
useEffect(() => {

  if (!window.posApi?.onKotReceived) {
    console.log(
      'WAITER KOT LISTENER API NOT AVAILABLE'
    );
    return;
  }

  console.log(
    'REGISTERING BILL WAITER KOT LISTENER'
  );

  const unsubscribe =
    window.posApi.onKotReceived((data) => {

      console.log(
        'WAITER KOT RECEIVED IN BILL UI:',
        data
      );

      if (
        data?.tableNo &&
        data.tableNo !== currentTableId
      ) {
        return;
      }

      loadBillItems();

    });

  return unsubscribe;

}, [currentTableId]);



async function loadBillItems() {
  if (!currentTableId) return;

  try {
    setLoading(true);

    // =============================================
    // BILL ITEMS
    // =============================================

    const billRows =
      await window.posApi.getBillItems(
        currentTableId
      );

    // =============================================
    // CART ITEMS
    //
    // These may not have been sent to kitchen/bill yet
    // =============================================

    const cartRows =
      await window.posApi.getCartItems(
        currentTableId
      );

    console.log(
      'BILL ITEMS =>',
      currentTableId,
      billRows
    );

    console.log(
      'CART ITEMS =>',
      currentTableId,
      cartRows
    );

    // =============================================
    // COMBINE
    // =============================================

    const combinedRows = [
      ...(billRows || []),
      ...(cartRows || []),
    ];

    setBillRows(combinedRows);

  } catch (e) {

    console.error(
      'Failed to load bill/cart items',
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

      const result =
    await window.posApi.updateBillItemQuantity({

      tableNo:
        currentTableId,

      billItemGroupKey:
        item.billItemGroupKey,

      quantity,
    });

  if (!result?.success) {
    throw new Error(
      result?.error ||
      'Failed to update item quantity'
    );
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

  console.log(
    '========================================'
  );

  console.log(
    'INCREASE BILL ITEM - RAW ITEM:'
  );

  console.log(
    item
  );

  console.log(
    'INCREASE BILL ITEM - JSON:'
  );

  console.log(
    JSON.stringify(
      item,
      null,
      2
    )
  );

  console.log(
    'INCREASE BILL ITEM - QUANTITY:',
    item?.quantity
  );

  console.log(
    'INCREASE BILL ITEM - PRODUCT ID:',
    item?.productId
  );

  console.log(
    'INCREASE BILL ITEM - GROUP KEY:',
    item?.billItemGroupKey
  );

  console.log(
    'INCREASE BILL ITEM - MODIFIERS:',
    item?.modifiersJson
  );

  console.log(
    'INCREASE BILL ITEM - NOTE:',
    item?.note
  );

  console.log(
    '========================================'
  );

  const currentQuantity =
    Number(item.quantity || 0);

  const newQuantity =
    currentQuantity + 1;

  console.log(
    'CALCULATED QUANTITY:',
    {
      currentQuantity,
      newQuantity,
    }
  );

  await updateBillItemQuantity(
    item,
    newQuantity
  );
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
      currentOrderType,

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
// MULTIPLE / CREDIT PAYMENT CHECKOUT
// =====================================================

async function handlePaymentAllocation(
  payment: PaymentAllocationValue
) {
  if (processing) {
    return;
  }

  if (billItems.length === 0) {
    setError('No items in bill');
    return;
  }

  if (!currentTableId) {
    setError('No table selected');
    return;
  }

  const totalAmount =
    Number(calculation.grandTotal) || 0;

  const cash = Math.max(0, Number(payment.cash) || 0);
  const card = Math.max(0, Number(payment.card) || 0);
  const upi = Math.max(0, Number(payment.upi) || 0);
  const credit = Math.max(0, Number(payment.credit) || 0);

  const totalAllocated =
    cash +
    card +
    upi +
    credit;

  // Small floating-point tolerance
  if (
    Math.abs(totalAllocated - totalAmount) > 0.01
  ) {
    setError(
      `Payment allocation must equal ₹${totalAmount.toFixed(2)}`
    );
    return;
  }

  try {
    setProcessing(true);
    setError(null);

    // =================================================
    // BUILD PAYMENT ARRAY
    // =================================================

    const payments: {
      mode:
        | 'CASH'
        | 'CARD'
        | 'UPI'
        | 'CREDIT';

      amount: number;
    }[] = [];

    if (cash > 0) {
      payments.push({
        mode: 'CASH',
        amount: cash,
      });
    }

    if (card > 0) {
      payments.push({
        mode: 'CARD',
        amount: card,
      });
    }

    if (upi > 0) {
      payments.push({
        mode: 'UPI',
        amount: upi,
      });
    }

    if (credit > 0) {
      payments.push({
        mode: 'CREDIT',
        amount: credit,
      });
    }

    // =================================================
    // DETERMINE PAYMENT STATUS
    // =================================================

    const paidAmount =
      cash +
      card +
      upi;

    let paymentStatus:
      | 'PAID'
      | 'PARTIAL'
      | 'CREDIT';

    if (credit <= 0.01) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'CREDIT';
    }

    // =================================================
    // PAYMENT MODE
    //
    // For multiple payments use MIXED.
    // For single payment keep actual mode.
    // =================================================

    let finalPaymentMode:
      | 'CASH'
      | 'CARD'
      | 'UPI'
      | 'CREDIT'
      | 'MIXED';

    if (payments.length === 1) {
      finalPaymentMode = payments[0].mode;
    } else {
      finalPaymentMode = 'MIXED';
    }

    console.log(
      'MULTIPLE PAYMENT CHECKOUT:',
      {
        totalAmount,
        payments,
        paidAmount,
        credit,
        paymentStatus,
        finalPaymentMode,
      }
    );

    // =================================================
    // CREATE BILL
    // =================================================

    const result =
      await window.posApi.createBill({

        tableNo:
          currentTableId,

        tableName:
          currentTableName,

         orderType:
      currentOrderType,

        customerName:
          customerName.trim() ||
          'Customer',

        customerPhone:
          customerPhone.trim(),

        // =================================================
        // TAX / DISCOUNT / DELIVERY
        // =================================================

        discountTotal:
          calculation.discount,

        deliveryFee:
          calculation.deliveryFee,

        deliveryTax:
          calculation.deliveryTax,

        // =================================================
        // PAYMENT
        // =================================================

        paymentMode:
          finalPaymentMode,

        paymentStatus,

        paidAmount,

        payments,

        // =================================================
        // DEVICE
        // =================================================

        deviceId:
          'POS',

        deviceName:
          'Electron POS',

        appVersion:
          '1.0',

        // =================================================
        // DATE
        // =================================================

        businessDate:
          new Date()
            .toISOString()
            .slice(0, 10),

        currency:
          '₹',
      });

    // =================================================
    // CHECK BILL RESULT
    // =================================================

    if (!result?.success) {
      throw new Error(
        result?.error ||
        'Failed to create bill'
      );
    }

    console.log(
      'MULTIPLE PAYMENT BILL CREATED:',
      result
    );

    // =================================================
    // MARK KOT HISTORY PAID
    // =================================================

    const kotResult =
      await window.posApi.markTableHistoryPaid({
        tableNo:
          currentTableId,

        billItems:
          billItems,

        orderId:
          result.srno || '',
      });

    if (!kotResult?.success) {
      throw new Error(
        kotResult?.error ||
        'Failed to update KOT history'
      );
    }

    // =================================================
    // RESET BILL DRAFT
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
    // RESET PAYMENT ALLOCATION
    // =================================================

    setPaymentAllocation({
      cash: 0,
      card: 0,
      upi: 0,
      credit: 0,
    });

    // =================================================
    // CLOSE PAYMENT SUMMARY
    // =================================================

    setShowPaymentSummary(false);

    // =================================================
    // CLEAR BILL
    // =================================================

    setBillRows([]);

    // =================================================
    // RELOAD
    // =================================================

    await loadBillItems();

    // =================================================
    // SUCCESS
    // =================================================

    onSuccess?.();

  } catch (e) {

    console.error(
      'MULTIPLE PAYMENT CHECKOUT FAILED:',
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
// COMPLIMENTARY CHECKOUT
// =====================================================

async function handleComplimentaryCheckout(
  reason: string
) {
  if (processing) {
    return;
  }

  if (billItems.length === 0) {
    setError('No items in bill');
    return;
  }

  if (!currentTableId) {
    setError('No table selected');
    return;
  }

  try {
    setProcessing(true);
    setError(null);

    console.log(
      'COMPLIMENTARY BILL:',
      {
        reason,
        tableNo: currentTableId,
        items: billItems,
      }
    );

    // =================================================
    // 1. CREATE COMPLIMENTARY BILL
    // =================================================

const result =
  await window.posApi.createBill({

    tableNo:
      currentTableId,

    tableName:
      currentTableName,

    orderType:
      currentOrderType,

    customerName:
      customerName.trim() ||
      'Customer',

    customerPhone:
      customerPhone.trim(),

    // =================================================
    // COMPLIMENTARY
    // =================================================

    billType:
      'COMPLIMENTARY',

    complimentaryReason:
      reason,

    // =================================================
    // TAX / DISCOUNT / DELIVERY
    // =================================================

    discountTotal:
      0,

    deliveryFee:
      0,

    deliveryTax:
      0,

    // =================================================
    // PAYMENT
    // =================================================

    paymentMode:
      'COMPLIMENTARY',

    paymentStatus:
      'PAID',

    paidAmount:
      0,

    payments: [
      {
        mode:
          'COMPLIMENTARY',

        amount:
          0,
      },
    ],

    // =================================================
    // DEVICE
    // =================================================

    deviceId:
      'POS',

    deviceName:
      'Electron POS',

    appVersion:
      '1.0',

    // =================================================
    // DATE
    // =================================================

    businessDate:
      new Date()
        .toISOString()
        .slice(0, 10),

    currency:
      '₹',
  });


    // =================================================
    // 2. CHECK RESULT
    // =================================================

    if (!result?.success) {

      throw new Error(
        result?.error ||
        'Failed to create complimentary bill'
      );
    }


    console.log(
      'COMPLIMENTARY BILL CREATED:',
      result
    );


    // =================================================
    // 3. MARK KOT HISTORY PAID
    // =================================================

    const kotResult =
      await window.posApi.markTableHistoryPaid({

        tableNo:
          currentTableId,

        billItems:
          billItems,

        orderId:
          result.srno || '',

      });


    if (!kotResult?.success) {

      throw new Error(
        kotResult?.error ||
        'Failed to update KOT history'
      );
    }


    // =================================================
    // 4. RESET BILL DRAFT
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
    // 5. CLEAR BILL UI
    // =================================================

    setBillRows([]);


    // =================================================
    // 6. RELOAD BILL ITEMS
    // =================================================

    await loadBillItems();


    // =================================================
    // 7. CLEAR COMPLIMENTARY STATE
    // =================================================

    setComplimentaryReason(null);

    setShowMoreMenu(false);

    setShowComplimentaryMenu(false);


    // =================================================
    // 8. SUCCESS
    // =================================================

    onSuccess?.();

  } catch (e) {

    console.error(
      'COMPLIMENTARY BILL FAILED',
      e
    );

    const message =
      e instanceof Error
        ? e.message
        : String(e);

    setError(
      message ||
      'Complimentary bill failed'
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
      currentOrderType,

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
      currentOrderType,

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
// PAYMENT SUMMARY VALUES
// =====================================================

const grandTotal =
  Number(calculation.grandTotal || 0);

const totalPaid =
  Number(paidAmount || 0);

const cashPaid =
  paymentMode === 'CASH'
    ? totalPaid
    : 0;

const cardPaid =
  paymentMode === 'CARD'
    ? totalPaid
    : 0;

const upiPaid =
  paymentMode === 'UPI'
    ? totalPaid
    : 0;

const creditAmount =
  Math.max(
    0,
    grandTotal - totalPaid
  );

const isPartialPayment =
  totalPaid > 0 &&
  creditAmount > 0;

const isCreditSale =
  totalPaid === 0 &&
  creditAmount > 0;

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

<div
  className="
    relative
    shrink-0
    px-2
    bg-zinc-800
    py-1
  "
>

  {/* =================================================
      PAYMENT SUMMARY STRIP
  ================================================= */}

  {showPaymentSummary && (
    <div
      className="
        absolute
        bottom-[100%]
        left-2
        right-2
        mb-1
        z-40
        overflow-hidden
        rounded-t-md
        border
        border-zinc-600
        bg-zinc-900
        shadow-xl
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-zinc-700
          px-3
          py-2
        "
      >
        <div
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-white
          "
        >
          {isCreditSale
            ? 'Credit Sale'
            : 'Partial Payment'}
        </div>

        <div
          className="
            text-xs
            font-semibold
            text-zinc-300
          "
        >
          ₹{Number(grandTotal || 0).toFixed(2)}
        </div>
      </div>


      {/* PAYMENT BREAKDOWN */}

      <div
        className="
          max-h-32
          overflow-y-auto
          px-3
          py-2
        "
      >

        {/* CASH */}

        {cashPaid > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              py-1
              text-xs
            "
          >
            <span className="text-zinc-400">
              CASH
            </span>

            <span className="font-semibold text-white">
              ₹{Number(cashPaid).toFixed(2)}
            </span>
          </div>
        )}


        {/* CARD */}

        {cardPaid > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              py-1
              text-xs
            "
          >
            <span className="text-zinc-400">
              CARD
            </span>

            <span className="font-semibold text-white">
              ₹{Number(cardPaid).toFixed(2)}
            </span>
          </div>
        )}


        {/* UPI */}

        {upiPaid > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              py-1
              text-xs
            "
          >
            <span className="text-zinc-400">
              UPI
            </span>

            <span className="font-semibold text-white">
              ₹{Number(upiPaid).toFixed(2)}
            </span>
          </div>
        )}


        {/* CREDIT */}

       {/* {showPaymentAllocation && ( */}
     <PaymentAllocation
  totalAmount={calculation.grandTotal}
  value={paymentAllocation}
  onChange={setPaymentAllocation}
  onPay={handlePaymentAllocation}
  onCancel={() => {
    setShowPaymentSummary(false);

    setPaymentAllocation({
      cash: 0,
      card: 0,
      upi: 0,
      credit: 0,
    });
  }}
/>
        {/* )} */}

      </div>


      {/* TOTALS */}

      <div
        className="
          border-t
          border-zinc-700
          px-3
          py-2
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            text-xs
          "
        >
          <span className="text-zinc-400">
            PAID
          </span>

          <span className="font-semibold text-green-400">
            ₹{Number(paidAmount || 0).toFixed(2)}
          </span>
        </div>


        <div
          className="
            mt-1
            flex
            items-center
            justify-between
            text-xs
          "
        >
          <span className="text-zinc-400">
            DUE
          </span>

          <span
            className="
              font-semibold
              text-red-400
            "
          >
            ₹{Number(dueAmount || 0).toFixed(2)}
          </span>
        </div>

      </div>

    </div>
  )}


  {/* =================================================
      PAYMENT STATUS BADGE
  ================================================= */}

  {(isPartialPayment || isCreditSale) && (
    <button
      type="button"
      onClick={() =>
        setShowPaymentSummary(
          (prev) => !prev
        )
      }
      className="
        absolute
        bottom-[100%]
        left-1/2
        z-50
        flex
        -translate-x-1/2
        translate-y-[1px]
        items-center
        gap-1
        rounded-t-md
        border
        border-b-0
        border-zinc-600
        bg-zinc-800
        px-3
        py-1
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        text-white
        shadow-md
        transition-colors
        hover:bg-zinc-700
      "
    >

      {/* UP ARROW */}

      <span
        className={`
          text-[11px]
          transition-transform
          duration-200
          ${
            showPaymentSummary
              ? 'rotate-180'
              : ''
          }
        `}
      >
        ↑
      </span>


      {/* TITLE */}

      <span>
        {isCreditSale
          ? 'CREDIT + Mix Pay'
          : 'PARTIAL'}
      </span>

    </button>
  )}


  {/* =================================================
      PAYMENT BUTTONS
  ================================================= */}

  <div className="flex items-center gap-2">

    {/* PRINT */}

    <button
      type="button"
      onClick={printBill}
      className={`
        h-8
        w-fit
        rounded
        px-3
        text-xs
        font-semibold
        ${POS_THEME.BillButton}
      `}
    >
      PRINT
    </button>


    {/* CASH */}

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
        rounded-md
        bg-green-600
        px-3
        text-xs
        font-semibold
        text-white
        transition-colors
        hover:bg-green-700
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {processing
        ? 'PROCESSING...'
        : 'CASH'}
    </button>


    {/* CARD */}

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
        rounded-md
        bg-blue-600
        px-3
        text-xs
        font-semibold
        text-white
        transition-colors
        hover:bg-blue-700
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      CARD
    </button>


    {/* UPI */}

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
        rounded-md
        bg-purple-600
        px-3
        text-xs
        font-semibold
        text-white
        transition-colors
        hover:bg-purple-700
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      UPI
    </button>


    {/* MORE */}

{/* =================================================
    MORE STATUS STRIP
================================================= */}

<button
  type="button"
  onClick={() =>
    setShowMoreMenu(
      (prev) => !prev
    )
  }
  className="
    absolute
    bottom-[100%]
    right-2
    z-50
    flex
    items-center
    gap-1
    rounded-t-md
    border
    border-b-0
    border-zinc-600
    bg-zinc-800
    px-3
    py-1
    text-[10px]
    font-bold
    uppercase
    tracking-wide
    text-white
    shadow-md
    transition-colors
    hover:bg-zinc-700
  "
>
  {/* ARROW */}

  <span
    className="
      text-[11px]
      transition-transform
      duration-200
    "
  >
    ↑
  </span>

  {/* TITLE */}

  <span>
    MORE
  </span>

</button>

            {showMoreMenu && (
  <div
    className="
      absolute
      bottom-[100%]
      right-2
      mb-2
      z-50
      w-48
      rounded-lg
      border
      border-zinc-600
      bg-zinc-800
      p-1
      shadow-xl
    "
  >

    {/* =========================================
        COMPLIMENTARY
    ========================================= */}

    <button
      type="button"
  onClick={() => {
  setShowMoreMenu(false);
  setShowComplimentaryMenu(true);
}}
      className="
        flex
        w-full
        items-center
        rounded-md
        px-3
        py-2
        text-left
        text-xs
        font-medium
        text-white
        hover:bg-zinc-700
        transition-colors
      "
    >
      Complimentary
    </button>


    {/* =========================================
        DRIVER
    ========================================= */}

    <button
      type="button"
      onClick={() => {
       handleComplimentaryCheckout('DRIVER')

        setShowMoreMenu(false);
      }}
      className="
        flex
        w-full
        items-center
        rounded-md
        px-3
        py-2
        text-left
        text-xs
        font-medium
        text-white
        hover:bg-zinc-700
        transition-colors
      "
    >
      Driver
    </button>


    {/* =========================================
        FRIEND
    ========================================= */}

    <button
      type="button"
      onClick={() => {
        handleComplimentaryCheckout('FRIEND')

        setShowMoreMenu(false);
      }}
      className="
        flex
        w-full
        items-center
        rounded-md
        px-3
        py-2
        text-left
        text-xs
        font-medium
        text-white
        hover:bg-zinc-700
        transition-colors
      "
    >
      Friend
    </button>


    {/* =========================================
        FAMILY
    ========================================= */}

    <button
      type="button"
      onClick={() => {
       handleComplimentaryCheckout('FAMILY')

        setShowMoreMenu(false);
      }}
      className="
        flex
        w-full
        items-center
        rounded-md
        px-3
        py-2
        text-left
        text-xs
        font-medium
        text-white
        hover:bg-zinc-700
        transition-colors
      "
    >
      Family
    </button>


    {/* =========================================
        STAFF
    ========================================= */}

    <button
      type="button"
      onClick={() => {
       handleComplimentaryCheckout('STAFF')

        setShowMoreMenu(false);
      }}
      className="
        flex
        w-full
        items-center
        rounded-md
        px-3
        py-2
        text-left
        text-xs
        font-medium
        text-white
        hover:bg-zinc-700
        transition-colors
      "
    >
      Staff
    </button>


    {/* =========================================
        OWNER
    ========================================= */}

    <button
      type="button"
      onClick={() => {
       handleComplimentaryCheckout('OWNER')

        setShowMoreMenu(false);
      }}
      className="
        flex
        w-full
        items-center
        rounded-md
        px-3
        py-2
        text-left
        text-xs
        font-medium
        text-white
        hover:bg-zinc-700
        transition-colors
      "
    >
      Owner
    </button>

  </div>
)}

  </div>

  {/* KEEP YOUR EXISTING MORE MENU HERE */}

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