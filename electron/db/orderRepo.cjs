const { db } = require('./sqlite.cjs');
const { randomUUID } = require('crypto');


// =====================================================
// INSERT ORDER MASTER + ORDER ITEMS
// =====================================================

function insertOrder(master, items) {

  const insertMaster = db.prepare(`
    INSERT INTO pos_order_master (

      id,
      srno,
      orderType,
      tableNo,
      tableName,

      customerName,
      customerPhone,

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

      deviceId,
      deviceName,
      appVersion,

      businessDate,
      createdAt,

      syncStatus

    ) VALUES (

      @id,
      @srno,
      @orderType,
      @tableNo,
      @tableName,

      @customerName,
      @customerPhone,

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

      @deviceId,
      @deviceName,
      @appVersion,

      @businessDate,
      @createdAt,

      @syncStatus

    )
  `);


  // ===================================================
  // ORDER ITEMS
  // ===================================================

  const insertItem = db.prepare(`
    INSERT INTO pos_order_items (

      id,
      orderMasterId,

      categoryName,
      productMode,
      currentStock,

      productId,
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

      createdAt

    ) VALUES (

      @id,
      @orderMasterId,

      @categoryName,
      @productMode,
      @currentStock,

      @productId,
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

      @createdAt

    )
  `);


  // ===================================================
  // TRANSACTION
  // ===================================================

  const tx = db.transaction(() => {

    // ================================================
    // ORDER MASTER
    // ================================================

    insertMaster.run({

      id:
        master.id,

      srno:
        master.srno,

      orderType:
        master.orderType,

      tableNo:
        master.tableNo ?? null,

      tableName:
        master.tableName ?? null,


      customerName:
        master.customerName ?? 'Customer',

      customerPhone:
        master.customerPhone ?? '',


      itemTotal:
        master.itemTotal ?? 0,

      itemTax:
        master.itemTax ?? 0,

      taxTotal:
        master.taxTotal ?? 0,

      discountTotal:
        master.discountTotal ?? 0,

      grandTotal:
        master.grandTotal ?? 0,


      paymentMode:
        master.paymentMode ?? 'CASH',

      paymentStatus:
        master.paymentStatus ?? 'PAID',

      paidAmount:
        master.paidAmount ?? 0,

      dueAmount:
        master.dueAmount ?? 0,


      orderStatus:
        master.orderStatus ?? 'COMPLETED',


      deviceId:
        master.deviceId ?? 'POS',

      deviceName:
        master.deviceName ?? 'Electron POS',

      appVersion:
        master.appVersion ?? '1.0',


      businessDate:
        master.businessDate ??
        getLocalBusinessDate(),

      createdAt:
        master.createdAt ??
        Date.now(),


      syncStatus:
        master.syncStatus ?? 'PENDING',

    });


    // ================================================
    // ORDER ITEMS
    // ================================================

    for (const item of items) {

      insertItem.run({

        id:
          randomUUID(),

        orderMasterId:
          master.id,


        categoryName:
          item.categoryName ?? '',

        productMode:
          item.productMode ?? '',

        currentStock:
          item.currentStock ?? 0,


        productId:
          item.productId ?? '',

        name:
          item.name ?? '',

        categoryId:
          item.categoryId ?? '',


        parentId:
          item.parentId ?? null,

        isVariant:
          item.isVariant ? 1 : 0,


        basePrice:
          item.basePrice ?? 0,

        quantity:
          item.quantity ?? 0,


        itemSubtotal:
          item.itemSubtotal ??
          (
            Number(item.basePrice || 0) *
            Number(item.quantity || 0)
          ),


        currency:
          item.currency ?? '₹',

        paymentStatus:
          item.paymentStatus ?? 'PAID',


        taxRate:
          item.taxRate ?? 0,

        taxType:
          item.taxType ?? 'exclusive',


        taxAmountPerItem:
          item.taxAmountPerItem ?? 0,

        taxTotal:
          item.taxTotal ?? 0,


        note:
          item.note ?? '',

        modifiersJson:
          item.modifiersJson ?? '',


        modifierPrice:
          item.modifierPrice ?? 0,

        modifierSummary:
          item.modifierSummary ?? '',


        finalPricePerItem:
          item.finalPricePerItem ??
          item.finalPrice ??
          item.basePrice ??
          0,


        finalTotal:
          item.finalTotal ??
          item.finalPrice ??
          (
            Number(item.basePrice || 0) *
            Number(item.quantity || 0)
          ),


        createdAt:
          item.createdAt ??
          Date.now(),

      });

    }

  });


  tx();
}


// =====================================================
// GET ORDER BY ID
// =====================================================

function getOrderById(id) {

  return db
    .prepare(`
      SELECT *
      FROM pos_order_master
      WHERE id = ?
    `)
    .get(id);
}


// =====================================================
// GET ORDER ITEMS
// =====================================================

function getOrderItems(orderMasterId) {

  return db
    .prepare(`
      SELECT *
      FROM pos_order_items
      WHERE orderMasterId = ?
      ORDER BY createdAt ASC
    `)
    .all(orderMasterId);
}


// =====================================================
// LOCAL BUSINESS DATE
// =====================================================

function getLocalBusinessDate() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, '0');


  const day =
    String(
      now.getDate()
    ).padStart(2, '0');


  return `${year}-${month}-${day}`;
}


// =====================================================
// GET ORDERS BY BUSINESS DATE
// =====================================================
//
// No date:
//   → today's orders
//
// With date:
//   → selected day's orders
//
// Example:
//
// getOrders()
//
// getOrders('2026-08-16')
//
// =====================================================

function getOrders(date) {

  const businessDate =
    date ||
    getLocalBusinessDate();


  return db
    .prepare(`
      SELECT

        id,
        srno,

        orderType,

        tableNo,
        tableName,

        customerName,
        customerPhone,

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

        deviceId,
        deviceName,
        appVersion,

        businessDate,
        createdAt,

        syncStatus

      FROM pos_order_master

      WHERE businessDate = ?

      ORDER BY createdAt DESC
    `)
    .all(businessDate);
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  insertOrder,

  getOrders,

  getOrderById,

  getOrderItems,

  getLocalBusinessDate,

};