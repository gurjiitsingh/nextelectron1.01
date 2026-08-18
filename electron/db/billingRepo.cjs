
const crypto = require('crypto');
const { db } = require('./sqlite.cjs');
const { insertOrder } = require('./orderRepo.cjs');
const businessDayRepo =
  require('./businessDayRepository.cjs');
const {
  getOrCreateOrderNo,
  attachOrderId,
  clearMapping,
} = require('../lib/orderSequenceRepository.cjs');

const kotHistoryRepo =
  require('./kotHistoryRepository.cjs');

// const {
//   getOrCreateOrderNo,
//   attachOrderId,
//   clearMapping,
//   moveTableMapping,
// } = require('../lib/orderSequence.cjs');

const {
  TERMINAL_CODE,
} = require('../lib/orderSequence.cjs');

// =====================================================
// HELPERS
// =====================================================

function uuid() {
  return crypto.randomUUID();
}


// =====================================================
// GET BILLABLE KOT ITEMS
// =====================================================
//
// We consider both PENDING and DONE as billable because
// the KOT has already been sent to the kitchen.
//
// Later, if your kitchen flow requires only DONE items,
// change this to:
//
// WHERE tableNo = ? AND status = 'DONE'
//
// =====================================================

function getBillableKotItems(tableNo) {


  if (!tableNo) {
    return [];
  }

  return db.prepare(`
    SELECT *
    FROM pos_bill_items
    WHERE tableNo = ?
      AND billed = 0
      AND status = 'OPEN'
    ORDER BY createdAt ASC
  `).all(tableNo);

  
  return items;
}


// =====================================================
// CREATE BILL
// =====================================================

async function createBillFromKitchen(input) {

  const {
    tableNo,
    orderType = 'DINE_IN',
    tableName,
    customerName = 'Customer',
    customerPhone = '',
    customerId = null,

    discountTotal = 0,
    deliveryFee = 0,
    deliveryTax = 0,

    paymentMode = 'CASH',
    paymentStatus = 'PAID',

    paidAmount = 0,

    payments = [],

    ownerId = '',
    outletId = '',

    deviceId = 'POS',
    deviceName = 'Electron POS',
    appVersion = '1.0',

    businessDate,

    currency = '₹',
  } = input;


  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!tableNo) {
    throw new Error('tableNo is required');
  }


  // ===================================================
  // READ KOT
  // ===================================================

  const kotItems =
    getBillableKotItems(tableNo);

 
  if (!kotItems.length) {
    throw new Error(
      `No billable kitchen items found for table ${tableNo}`
    );
  }


  const now = Date.now();

  const orderId = uuid();

  // =====================================================
  // ORDER NUMBER
  // Android-compatible order sequence
  // =====================================================

  const mapping = getOrCreateOrderNo(
    db,
    tableNo,
    TERMINAL_CODE
  );

  const srno = mapping.srno;


  // ===================================================
  // CALCULATE ITEMS
  // ===================================================

  let itemTotal = 0;
  let itemTax = 0;


  const orderItems = kotItems.map((kot) => {

    const quantity =
      Number(kot.quantity || 0);

    const basePrice =
      Number(kot.basePrice || 0);

    const modifierPrice =
      Number(kot.modifierTotal || 0);

    const priceBeforeTax =
      basePrice + modifierPrice;


    const itemSubtotal =
      priceBeforeTax * quantity;


    const taxRate =
      Number(kot.taxRate || 0);

    const taxType =
      kot.taxType || 'exclusive';


    let taxAmountPerItem = 0;


    if (taxType === 'exclusive') {
      taxAmountPerItem =
        priceBeforeTax *
        (taxRate / 100);
    }


    const taxTotal =
      taxAmountPerItem * quantity;


    const finalPricePerItem =
      priceBeforeTax +
      taxAmountPerItem;


    const finalTotal =
      finalPricePerItem *
      quantity;


    itemTotal += itemSubtotal;
    itemTax += taxTotal;


    return {

      id: uuid(),

      categoryName:
        kot.categoryName || '',

      productMode:
        kot.productMode || 'raw_stock',

      currentStock:
        Number(kot.currentStock || 0),

      orderMasterId:
        orderId,

      productId:
        kot.productId,

      createdById:
        kot.createdById || '',

      createdByName:
        kot.createdByName || '',

      name:
        kot.name || '',

      categoryId:
        kot.categoryId || '',

      parentId:
        kot.parentId || null,

      isVariant:
        kot.isVariant ? 1 : 0,

      basePrice,

      quantity,

      itemSubtotal,

      currency,

      paymentStatus,

      taxRate,

      taxType,

      taxAmountPerItem,

      taxTotal,

      note:
        kot.note || '',

      modifiersJson:
        kot.modifiersJson || '',

      modifierPrice,

      modifierSummary:
        '',

      finalPricePerItem,

      finalTotal,

      source:
        kot.source || 'POS',

      createdAt:
        now,
    };
  });




  // ===================================================
  // FINAL TOTALS
  // ===================================================

  const safeDiscount =
    Math.max(
      0,
      Number(discountTotal || 0)
    );


  const safeDeliveryFee =
    Math.max(
      0,
      Number(deliveryFee || 0)
    );


  const safeDeliveryTax =
    Math.max(
      0,
      Number(deliveryTax || 0)
    );


  const taxTotal =
    itemTax + safeDeliveryTax;


  const grandTotal =
    Math.max(
      0,
      itemTotal +
      taxTotal +
      safeDeliveryFee -
      safeDiscount
    );


  const safePaidAmount =
    Math.max(
      0,
      Number(paidAmount || 0)
    );


  const dueAmount =
    Math.max(
      0,
      grandTotal -
      safePaidAmount
    );


  // ===================================================
  // PAYMENT ARRAY
  // ===================================================

  let finalPayments = payments;


  // If caller didn't provide payment array,
  // create one from paymentMode + paidAmount.

  if (
    !Array.isArray(finalPayments) ||
    finalPayments.length === 0
  ) {

    if (safePaidAmount > 0) {

      finalPayments = [
        {
          mode: paymentMode,
          amount: safePaidAmount,
        },
      ];

    } else {

      finalPayments = [];
    }
  }

  //  await db.exec(`
  //     ALTER TABLE pos_order_master
  //     ADD COLUMN tableName TEXT;
  //   `);
  // =====================================================
  // GET CURRENT BUSINESS DATE
  // =====================================================

  const currentBusinessDay =
    businessDayRepo.getCurrentBusinessDay();

  if (!currentBusinessDay) {
    throw new Error(
      'Current business day not found.'
    );
  }

  if (currentBusinessDay.isClosed) {
    throw new Error(
      'Business day is closed.'
    );
  }

  const finalBusinessDate =
    currentBusinessDay.businessDate;
  // ===================================================
  // TRANSACTION
  // ===================================================

const transaction =
  db.transaction(() => {

    // ================================================
    // 1. CREATE ORDER MASTER
    // ================================================

    // your existing order master INSERT


    // ================================================
    // CLEAR SERIAL MAPPING
    // ================================================

    clearMapping(
      db,
      tableNo
    );


    // ================================================
    // 2. CREATE ORDER ITEMS
    // ================================================

    const insertItem =
      db.prepare(`
        INSERT INTO pos_order_items (

          id,

          categoryName,
          productMode,
          currentStock,

          orderMasterId,
          productId,

          createdById,
          createdByName,

          name,
          categoryId,

          parentId,
          isVariant,

          basePrice,
          quantity,
          itemSubtotal,

          currency,
          paymentStatus,

          taxRate,
          taxType,

          taxAmountPerItem,
          taxTotal,

          note,
          modifiersJson,
          modifierPrice,
          modifierSummary,

          finalPricePerItem,
          finalTotal,

          source,

          createdAt

        ) VALUES (

          @id,

          @categoryName,
          @productMode,
          @currentStock,

          @orderMasterId,
          @productId,

          @createdById,
          @createdByName,

          @name,
          @categoryId,

          @parentId,
          @isVariant,

          @basePrice,
          @quantity,
          @itemSubtotal,

          @currency,
          @paymentStatus,

          @taxRate,
          @taxType,

          @taxAmountPerItem,
          @taxTotal,

          @note,
          @modifiersJson,
          @modifierPrice,
          @modifierSummary,

          @finalPricePerItem,
          @finalTotal,

          @source,

          @createdAt
        )
      `);


    for (const item of orderItems) {

      insertItem.run(item);

    }


    // ================================================
    // 3. CREATE PAYMENTS
    // ================================================

    const insertPayment =
      db.prepare(`
        INSERT INTO pos_order_payments (

          id,
          orderId,

          ownerId,
          outletId,

          amount,

          mode,

          provider,
          method,

          status,

          deviceId,

          createdAt,
          businessDate,

          syncStatus,
          lastSyncedAt,

          isVoided

        ) VALUES (

          @id,
          @orderId,

          @ownerId,
          @outletId,

          @amount,

          @mode,

          @provider,
          @method,

          @status,

          @deviceId,

          @createdAt,
          @businessDate,

          @syncStatus,
          @lastSyncedAt,

          @isVoided

        )
      `);


    for (const payment of finalPayments) {

      const amount =
        Number(payment.amount || 0);

      if (amount <= 0) {
        continue;
      }

      insertPayment.run({

        id:
          uuid(),

        orderId,

        ownerId,

        outletId,

        amount,

        mode:
          payment.mode ||
          paymentMode,

        provider:
          payment.provider ||
          null,

        method:
          payment.method ||
          null,

        status:
          'SUCCESS',

        deviceId,

        createdAt:
          now,

        businessDate:
          finalBusinessDate,

        syncStatus:
          'PENDING',

        lastSyncedAt:
          null,

        isVoided:
          0,

      });

    }



    // ================================================
    // 5. COMPLETE KOT
    // ================================================

    db.prepare(`
      UPDATE pos_kot_items

      SET
        status = 'PAID'

      WHERE tableNo = ?

        AND status IN (
          'PENDING',
          'DONE'
        )
    `).run(tableNo);


    // ================================================
    // 6. DELETE ACTIVE KOT
    // ================================================

    db.prepare(`
      DELETE FROM pos_kot_items

      WHERE tableNo = ?

        AND status = 'PAID'
    `).run(tableNo);

  });

  // ================================================
  // 6. MARK BILL ITEMS AS BILLED
  // ================================================

  db.prepare(`
  UPDATE pos_bill_items
  SET billed = 1,
      status = 'BILLED',
      billId = ?,
      billNo = ?
  WHERE tableNo = ?
    AND billed = 0
`).run(orderId, srno, tableNo);


  // ================================================
  // 7. CLEAR BILLED BILL ITEMS
  // ================================================
  // Remove temporary bill rows after successful billing.

  db.prepare(`
  DELETE FROM pos_bill_items
  WHERE tableNo = ?
    AND billed = 1
`).run(tableNo);


  // ===================================================
  // EXECUTE TRANSACTION
  // ===================================================

  transaction();


  attachOrderId(
    db,
    tableNo,
    orderId
  );


  // ===================================================
  // RETURN RESULT TO REACT
  // ===================================================

  return {

    success: true,

    orderId,

    srno,

    tableNo,

    itemCount:
      orderItems.length,

    itemTotal,

    itemTax,

    taxTotal,

    discountTotal:
      safeDiscount,

    deliveryFee:
      safeDeliveryFee,

    grandTotal,

    paidAmount:
      safePaidAmount,

    dueAmount,

    paymentStatus,
  };
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createBillFromKitchen,
  getBillableKotItems,
};

