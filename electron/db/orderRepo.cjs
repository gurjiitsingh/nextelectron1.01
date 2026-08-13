const { db } = require('./sqlite.cjs');
const { randomUUID } = require('crypto');

// =====================================================
// INSERT ORDER MASTER + ORDER ITEMS
// =====================================================

function insertOrder(master, items) {
  const insertMaster = db.prepare(`
    INSERT INTO pso_order_master (
      id,
      srno,
      orderType,
      tableNo,

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

  const tx = db.transaction(() => {
    insertMaster.run(master);

    for (const item of items) {
      insertItem.run({
        id: randomUUID(),
        orderMasterId: master.id,

        categoryName: item.categoryName ?? '',
        productMode: item.productMode ?? '',
        currentStock: item.currentStock ?? 0,

        productId: item.productId,
        name: item.name,
        categoryId: item.categoryId,

        parentId: item.parentId ?? null,
        isVariant: item.isVariant ? 1 : 0,

        basePrice: item.basePrice,
        quantity: item.quantity,

        itemSubtotal:
          item.itemSubtotal ??
          item.basePrice * item.quantity,

        currency: item.currency ?? '₹',
        paymentStatus: item.paymentStatus ?? 'PAID',

        taxRate: item.taxRate ?? 0,
        taxType: item.taxType ?? 'exclusive',

        taxAmountPerItem:
          item.taxAmountPerItem ?? 0,

        taxTotal: item.taxTotal ?? 0,

        note: item.note ?? '',
        modifiersJson: item.modifiersJson ?? '',

        modifierPrice: item.modifierPrice ?? 0,
        modifierSummary:
          item.modifierSummary ?? '',

        finalPricePerItem:
          item.finalPricePerItem ??
          item.finalPrice ??
          item.basePrice,

        finalTotal:
          item.finalTotal ??
          item.finalPrice ??
          item.basePrice * item.quantity,

        createdAt: item.createdAt ?? Date.now(),
      });
    }
  });

  tx();
}

// =====================================================
// OPTIONAL HELPERS
// =====================================================

function getOrderById(id) {
  return db
    .prepare(
      'SELECT * FROM pos_order_master WHERE id = ?'
    )
    .get(id);
}

function getOrderItems(orderMasterId) {
  return db
    .prepare(
      'SELECT * FROM pos_order_items WHERE orderMasterId = ?'
    )
    .all(orderMasterId);
}


function getOrders(limit = 100) {
  return db.prepare(`
    SELECT
      id,
      srno,
      orderType,
      tableNo,
      customerName,
      customerPhone,
      grandTotal,
      paymentMode,
      paymentStatus,
      orderStatus,
      businessDate,
      createdAt
    FROM pos_order_master
    ORDER BY createdAt DESC
    LIMIT ?
  `).all(limit);
}



module.exports = {
  insertOrder,
  getOrders,
  getOrderById,
  getOrderItems,
};