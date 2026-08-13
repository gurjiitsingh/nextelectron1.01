const db = require('./sqlite.cjs');
const { randomUUID } = require('crypto');

function insertOrder(master, items) {
  const insertMaster = db.prepare(`
    INSERT INTO order_master (
      id, srno, orderType, tableNo,
      customerName, customerPhone,
      itemTotal, itemTax, taxTotal,
      discountTotal, grandTotal,
      paymentMode, paymentStatus,
      paidAmount, dueAmount,
      orderStatus,
      deviceId, deviceName, appVersion,
      businessDate, createdAt,
      syncStatus
    ) VALUES (
      @id, @srno, @orderType, @tableNo,
      @customerName, @customerPhone,
      @itemTotal, @itemTax, @taxTotal,
      @discountTotal, @grandTotal,
      @paymentMode, @paymentStatus,
      @paidAmount, @dueAmount,
      @orderStatus,
      @deviceId, @deviceName, @appVersion,
      @businessDate, @createdAt,
      @syncStatus
    )
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (
      id, orderMasterId,
      categoryName, productMode, currentStock,
      productId, name, categoryId,
      parentId, isVariant,
      basePrice, quantity, itemSubtotal,
      currency, paymentStatus,
      taxRate, taxType,
      taxAmountPerItem, taxTotal,
      note, modifiersJson,
      modifierPrice, modifierSummary,
      finalPricePerItem, finalTotal,
      createdAt
    ) VALUES (
      @id, @orderMasterId,
      @categoryName, @productMode, @currentStock,
      @productId, @name, @categoryId,
      @parentId, @isVariant,
      @basePrice, @quantity, @itemSubtotal,
      @currency, @paymentStatus,
      @taxRate, @taxType,
      @taxAmountPerItem, @taxTotal,
      @note, @modifiersJson,
      @modifierPrice, @modifierSummary,
      @finalPricePerItem, @finalTotal,
      @createdAt
    )
  `);

  const tx = db.transaction(() => {
    insertMaster.run(master);

    for (const item of items) {
      insertItem.run({
        id: randomUUID(),
        orderMasterId: master.id,
        ...item,
      });
    }
  });

  tx();
}

module.exports = { insertOrder };