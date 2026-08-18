
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
    // ===================================================
    // CORE
    // ===================================================

    tableNo,
    orderType = 'DINE_IN',
    tableName = '',

    saleType = '',
    reason = '',


    // ===================================================
    // CUSTOMER
    // ===================================================

    customerName = 'Customer',
    customerPhone = '',
    customerId = null,


    // ===================================================
    // USER SNAPSHOT
    // ===================================================

    createdById = '',
    createdByName = '',

    finalizedById = '',
    finalizedByName = '',


    // ===================================================
    // DELIVERY ADDRESS
    // ===================================================

    dAddressLine1 = '',
    dAddressLine2 = '',
    dCity = '',
    dState = '',
    dZipcode = '',
    dLandmark = '',


    // ===================================================
    // AMOUNTS
    // ===================================================

    discountTotal = 0,

    deliveryFee = 0,
    deliveryTax = 0,


    // ===================================================
    // PAYMENT
    // ===================================================

    paymentMode = 'CASH',
    paymentStatus = 'PAID',

    paidAmount = 0,

    payments = [],


    // ===================================================
    // EXTERNAL / OWNER INFO
    // ===================================================

    ownerId = '',
    outletId = '',


    // ===================================================
    // DEVICE
    // ===================================================

    deviceId = 'POS',
    deviceName = 'Electron POS',
    appVersion = '1.0',


    // ===================================================
    // BUSINESS DATE
    // ===================================================

    businessDate,


    // ===================================================
    // EXTRA
    // ===================================================

    notes = '',

    currency = '₹',

  } = input;


  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!tableNo) {
    throw new Error(
      'tableNo is required'
    );
  }


  // ===================================================
  // READ BILLABLE KOT ITEMS
  // ===================================================

  const kotItems =
    getBillableKotItems(tableNo);


  if (!kotItems.length) {

    throw new Error(
      `No billable kitchen items found for table ${tableNo}`
    );

  }


  // ===================================================
  // CREATE ORDER ID / TIME
  // ===================================================

  const now =
    Date.now();

  const orderId =
    uuid();


  // ===================================================
  // ORDER NUMBER
  // Android-compatible order sequence
  // ===================================================

  const mapping =
    getOrCreateOrderNo(
      db,
      tableNo,
      TERMINAL_CODE
    );

  const srno =
    mapping.srno;


  // ===================================================
  // CALCULATE ORDER ITEMS
  // ===================================================

  let itemTotal = 0;

  let itemTax = 0;


  const orderItems =
    kotItems.map((kot) => {

      // -----------------------------------------------
      // QUANTITY
      // -----------------------------------------------

      const quantity =
        Number(
          kot.quantity || 0
        );


      // -----------------------------------------------
      // BASE PRICE
      // -----------------------------------------------

      const basePrice =
        Number(
          kot.basePrice || 0
        );


      // -----------------------------------------------
      // MODIFIER PRICE
      // -----------------------------------------------

      const modifierPrice =
        Number(
          kot.modifierTotal || 0
        );


      // -----------------------------------------------
      // PRICE BEFORE TAX
      // -----------------------------------------------

      const priceBeforeTax =
        basePrice +
        modifierPrice;


      // -----------------------------------------------
      // ITEM SUBTOTAL
      // -----------------------------------------------

      const itemSubtotal =
        priceBeforeTax *
        quantity;


      // -----------------------------------------------
      // TAX
      // -----------------------------------------------

      const taxRate =
        Number(
          kot.taxRate || 0
        );


      const taxType =
        kot.taxType ||
        'exclusive';


      let taxAmountPerItem = 0;


      if (
        taxType.toLowerCase() ===
        'exclusive'
      ) {

        taxAmountPerItem =
          priceBeforeTax *
          (taxRate / 100);

      }


      const taxTotal =
        taxAmountPerItem *
        quantity;


      // -----------------------------------------------
      // FINAL PRICE
      // -----------------------------------------------

      const finalPricePerItem =
        priceBeforeTax +
        taxAmountPerItem;


      const finalTotal =
        finalPricePerItem *
        quantity;


      // -----------------------------------------------
      // MASTER TOTALS
      // -----------------------------------------------

      itemTotal +=
        itemSubtotal;

      itemTax +=
        taxTotal;


      // -----------------------------------------------
      // RETURN ORDER ITEM
      // -----------------------------------------------

      return {

        id:
          uuid(),


        categoryName:
          kot.categoryName ||
          '',


        productMode:
          kot.productMode ||
          'raw_stock',


        currentStock:
          Number(
            kot.currentStock || 0
          ),


        orderMasterId:
          orderId,


        productId:
          kot.productId ||
          '',


        createdById:
          kot.createdById ||
          createdById ||
          '',


        createdByName:
          kot.createdByName ||
          createdByName ||
          '',


        name:
          kot.name ||
          '',


        categoryId:
          kot.categoryId ||
          '',


        parentId:
          kot.parentId ||
          null,


        isVariant:
          kot.isVariant
            ? 1
            : 0,


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
          kot.note ||
          '',


        modifiersJson:
          kot.modifiersJson ||
          '',


        modifierPrice,


        modifierSummary:
          kot.modifierSummary ||
          '',


        finalPricePerItem,


        finalTotal,


        source:
          kot.source ||
          'POS',


        createdAt:
          kot.createdAt ||
          now,

      };

    });


  // ===================================================
  // SAFE AMOUNTS
  // ===================================================

  const safeDiscount =
    Math.max(
      0,
      Number(
        discountTotal || 0
      )
    );


  const safeDeliveryFee =
    Math.max(
      0,
      Number(
        deliveryFee || 0
      )
    );


  const safeDeliveryTax =
    Math.max(
      0,
      Number(
        deliveryTax || 0
      )
    );


  // ===================================================
  // TOTAL TAX
  // ===================================================

  const taxTotal =
    itemTax +
    safeDeliveryTax;


  // ===================================================
  // GRAND TOTAL
  // ===================================================

  const grandTotal =
    Math.max(
      0,

      itemTotal +
      taxTotal +
      safeDeliveryFee -
      safeDiscount
    );


  // ===================================================
  // PAID AMOUNT
  // ===================================================

  const safePaidAmount =
    Math.max(
      0,
      Number(
        paidAmount || 0
      )
    );


  // ===================================================
  // DUE AMOUNT
  // ===================================================

  const dueAmount =
    Math.max(
      0,

      grandTotal -
      safePaidAmount
    );


  // ===================================================
  // PAYMENT ARRAY
  // ===================================================

  let finalPayments =
    payments;


  if (
    !Array.isArray(
      finalPayments
    ) ||
    finalPayments.length === 0
  ) {

    if (
      safePaidAmount > 0
    ) {

      finalPayments = [
        {
          mode:
            paymentMode,

          amount:
            safePaidAmount,
        },
      ];

    } else {

      finalPayments = [];

    }

  }


  // ===================================================
  // BUSINESS DAY
  // ===================================================

  const currentBusinessDay =
    businessDayRepo
      .getCurrentBusinessDay();


  if (!currentBusinessDay) {

    throw new Error(
      'Current business day not found.'
    );

  }


  if (
    currentBusinessDay.isClosed
  ) {

    throw new Error(
      'Business day is closed.'
    );

  }


  // IMPORTANT:
  // Use actual active business day.
  //
  // Do not trust the UI's businessDate
  // when a business-day system exists.

  const finalBusinessDate =
    currentBusinessDay.businessDate;


  // ===================================================
  // ORDER STATUS
  // ===================================================

  const orderStatus =
    'COMPLETED';


  // ===================================================
  // SYNC STATUS
  // ===================================================

  const syncStatus =
    'PENDING';


  // ===================================================
  // TRANSACTION
  // ===================================================

  const transaction =
    db.transaction(() => {


      // =================================================
      // 1. INSERT ORDER MASTER
      // =================================================

      const insertMaster =
        db.prepare(`

          INSERT INTO pos_order_master (

            id,
            srno,

            orderType,

            tableNo,
            tableName,

            saleType,
            reason,

            customerName,
            customerPhone,
            customerId,

            createdById,
            createdByName,

            finalizedById,
            finalizedByName,

            dAddressLine1,
            dAddressLine2,
            dCity,
            dState,
            dZipcode,
            dLandmark,

            deliveryFee,
            deliveryTax,

            itemTotal,
            itemTax,
            taxTotal,
            discountTotal,
            grandTotal,

            paymentMode,
            paymentStatus,
            paidAmount,
            dueAmount,

            orderStatus,

            source,
            deviceId,
            deviceName,
            appVersion,

            businessDate,
            createdAt,
            updatedAt,

            syncStatus,
            lastSyncedAt,

            notes

          )

          VALUES (

            @id,
            @srno,

            @orderType,

            @tableNo,
            @tableName,

            @saleType,
            @reason,

            @customerName,
            @customerPhone,
            @customerId,

            @createdById,
            @createdByName,

            @finalizedById,
            @finalizedByName,

            @dAddressLine1,
            @dAddressLine2,
            @dCity,
            @dState,
            @dZipcode,
            @dLandmark,

            @deliveryFee,
            @deliveryTax,

            @itemTotal,
            @itemTax,
            @taxTotal,
            @discountTotal,
            @grandTotal,

            @paymentMode,
            @paymentStatus,
            @paidAmount,
            @dueAmount,

            @orderStatus,

            @source,
            @deviceId,
            @deviceName,
            @appVersion,

            @businessDate,
            @createdAt,
            @updatedAt,

            @syncStatus,
            @lastSyncedAt,

            @notes

          )

        `);


      insertMaster.run({

        // ---------------------------------------------
        // CORE
        // ---------------------------------------------

        id:
          orderId,

        srno:
          srno,

        orderType:
          orderType,

        tableNo:
          tableNo,

        tableName:
          tableName ||
          '',


        // ---------------------------------------------
        // SALE
        // ---------------------------------------------

        saleType:
          saleType ||
          '',

        reason:
          reason ||
          '',


        // ---------------------------------------------
        // CUSTOMER
        // ---------------------------------------------

        customerName:
          customerName ||
          'Customer',

        customerPhone:
          customerPhone ||
          '',

        customerId:
          customerId ||
          null,


        // ---------------------------------------------
        // USER SNAPSHOT
        // ---------------------------------------------

        createdById:
          createdById ||
          '',

        createdByName:
          createdByName ||
          '',

        finalizedById:
          finalizedById ||
          createdById ||
          '',

        finalizedByName:
          finalizedByName ||
          createdByName ||
          '',


        // ---------------------------------------------
        // DELIVERY ADDRESS
        // ---------------------------------------------

        dAddressLine1:
          dAddressLine1 ||
          '',

        dAddressLine2:
          dAddressLine2 ||
          '',

        dCity:
          dCity ||
          '',

        dState:
          dState ||
          '',

        dZipcode:
          dZipcode ||
          '',

        dLandmark:
          dLandmark ||
          '',


        // ---------------------------------------------
        // AMOUNTS
        // ---------------------------------------------

        deliveryFee:
          safeDeliveryFee,

        deliveryTax:
          safeDeliveryTax,

        itemTotal:
          itemTotal,

        itemTax:
          itemTax,

        taxTotal:
          taxTotal,

        discountTotal:
          safeDiscount,

        grandTotal:
          grandTotal,


        // ---------------------------------------------
        // PAYMENT
        // ---------------------------------------------

        paymentMode:
          paymentMode,

        paymentStatus:
          paymentStatus,

        paidAmount:
          safePaidAmount,

        dueAmount:
          dueAmount,


        // ---------------------------------------------
        // ORDER STATE
        // ---------------------------------------------

        orderStatus:
          orderStatus,


        // ---------------------------------------------
        // SOURCE / DEVICE
        // ---------------------------------------------

        source:
          'POS',

        deviceId:
          deviceId,

        deviceName:
          deviceName,

        appVersion:
          appVersion,


        // ---------------------------------------------
        // TIMING
        // ---------------------------------------------

        businessDate:
          finalBusinessDate,

        createdAt:
          now,

        updatedAt:
          now,


        // ---------------------------------------------
        // SYNC
        // ---------------------------------------------

        syncStatus:
          syncStatus,

        lastSyncedAt:
          null,


        // ---------------------------------------------
        // EXTRA
        // ---------------------------------------------

        notes:
          notes ||
          '',

      });


      // =================================================
      // 2. INSERT ORDER ITEMS
      // =================================================

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

          )

          VALUES (

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


      for (
        const item
        of orderItems
      ) {

        insertItem.run(item);

      }


      // =================================================
      // 3. INSERT PAYMENTS
      // =================================================

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

          )

          VALUES (

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


      for (
        const payment
        of finalPayments
      ) {

        const amount =
          Number(
            payment.amount || 0
          );


        if (
          amount <= 0
        ) {
          continue;
        }


        insertPayment.run({

          id:
            uuid(),

          orderId:
            orderId,

          ownerId:
            ownerId,

          outletId:
            outletId,

          amount:
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

          deviceId:
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


      // =================================================
      // 4. CLEAR SERIAL MAPPING
      // =================================================

      clearMapping(
        db,
        tableNo
      );


      // =================================================
      // 5. COMPLETE KOT
      // =================================================

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


      // =================================================
      // 6. DELETE PAID KOT ITEMS
      // =================================================

      db.prepare(`

        DELETE FROM pos_kot_items

        WHERE tableNo = ?

          AND status = 'PAID'

      `).run(tableNo);

    });


  // ===================================================
  // EXECUTE MAIN TRANSACTION
  // ===================================================

  transaction();


  // ===================================================
  // MARK BILL ITEMS AS BILLED
  // ===================================================

  db.prepare(`

    UPDATE pos_bill_items

    SET
      billed = 1,
      status = 'BILLED',
      billId = ?,
      billNo = ?

    WHERE tableNo = ?

      AND billed = 0

  `).run(
    orderId,
    srno,
    tableNo
  );


  // ===================================================
  // DELETE TEMPORARY BILL ITEMS
  // ===================================================

  db.prepare(`

    DELETE FROM pos_bill_items

    WHERE tableNo = ?

      AND billed = 1

  `).run(tableNo);


  // ===================================================
  // ATTACH ORDER ID
  // ===================================================

  attachOrderId(
    db,
    tableNo,
    orderId
  );


  // ===================================================
  // DEBUG VERIFY ORDER WAS SAVED
  // ===================================================

  const savedOrder =
    db.prepare(`

      SELECT
        id,
        srno,
        orderType,
        tableNo,
        tableName,

        saleType,
        reason,

        customerName,
        customerPhone,
        customerId,

        createdById,
        createdByName,

        finalizedById,
        finalizedByName,

        deliveryFee,
        deliveryTax,

        itemTotal,
        itemTax,
        taxTotal,
        discountTotal,
        grandTotal,

        paymentMode,
        paymentStatus,
        paidAmount,
        dueAmount,

        orderStatus,

        source,
        deviceId,
        deviceName,
        appVersion,

        businessDate,
        createdAt,
        updatedAt,

        syncStatus,
        lastSyncedAt,

        notes

      FROM pos_order_master

      WHERE id = ?

    `).get(orderId);


  console.log(
    '========================================'
  );

  console.log(
    'ORDER SAVED SUCCESSFULLY'
  );

  console.log(
    'ORDER ID:',
    orderId
  );

  console.log(
    'SRNO:',
    srno
  );

  console.log(
    'BUSINESS DATE:',
    finalBusinessDate
  );

  console.log(
    'GRAND TOTAL:',
    grandTotal
  );

  console.log(
    'SAVED ORDER:',
    savedOrder
  );

  console.log(
    '========================================'
  );


  // ===================================================
  // FINAL RESULT
  // ===================================================

  return {

    success:
      true,

    orderId:

      orderId,

    srno:

      srno,

    tableNo:

      tableNo,

    itemCount:

      orderItems.length,

    itemTotal:

      itemTotal,

    itemTax:

      itemTax,

    taxTotal:

      taxTotal,

    discountTotal:

      safeDiscount,

    deliveryFee:

      safeDeliveryFee,

    deliveryTax:

      safeDeliveryTax,

    grandTotal:

      grandTotal,

    paidAmount:

      safePaidAmount,

    dueAmount:

      dueAmount,

    paymentStatus:

      paymentStatus,

    businessDate:

      finalBusinessDate,

  };

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createBillFromKitchen,
  getBillableKotItems,
};

