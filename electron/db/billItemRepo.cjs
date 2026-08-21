const { db } = require('./sqlite.cjs');
const { randomUUID } = require('crypto');

// =====================================================
// INSERT BILL ITEMS
// =====================================================

function insertBillItems(items) {
//console.log("item inserted by insertBillItems:----------------888888888")

  const stmt = db.prepare(`
    INSERT INTO pos_bill_items (
      id,
      billItemGroupKey,
      sessionId,
      tableNo,
      tableName,
      productId,
      name,
      categoryId,
      categoryName,
      parentId,
      isVariant,
      basePrice,
      finalPrice,
      modifierTotal,
      quantity,
      taxRate,
      taxType,
      note,
      modifiersJson,
      status,
      billed,
      createdAt
    ) VALUES (
      @id,
      @billItemGroupKey,
      @sessionId,
      @tableNo,
      @tableName,
      @productId,
      @name,
      @categoryId,
      @categoryName,
      @parentId,
      @isVariant,
      @basePrice,
      @finalPrice,
      @modifierTotal,
      @quantity,
      @taxRate,
      @taxType,
      @note,
      @modifiersJson,
      'OPEN',
      0,
      @createdAt
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const item of rows) {
      stmt.run({
        id: randomUUID(),

        billItemGroupKey: [
          item.productId,
          item.basePrice,
          item.taxRate ?? 0,
          item.taxType ?? 'exclusive',
          item.note ?? '',
          item.modifiersJson ?? '',
        ].join('|'),

        sessionId: item.sessionId ?? '',
        tableNo: item.tableNo ?? '',
        tableName: item.tableName ?? '',

        productId: item.productId,
        name: item.name,

        categoryId: item.categoryId,
        categoryName: item.categoryName ?? '',

        parentId: item.parentId ?? null,
        isVariant: item.isVariant ? 1 : 0,

        basePrice: item.basePrice,
        finalPrice: item.finalPrice ?? item.basePrice,
        modifierTotal: item.modifierTotal ?? 0,

        quantity: item.quantity,

        taxRate: item.taxRate ?? 0,
        taxType: item.taxType ?? 'exclusive',

        note: item.note ?? '',
        modifiersJson: item.modifiersJson ?? '',

        createdAt: Date.now(),
      });
    }
  });

  insertMany(items);

  return { success: true, count: items.length };
}

// =====================================================
// GET OPEN BILL ITEMS
// =====================================================

function getOpenBillItems(tableNo) {
  return db.prepare(`
    SELECT *
    FROM pos_bill_items
    WHERE tableNo = ?
      AND billed = 0
      AND status = 'OPEN'
    ORDER BY createdAt ASC
  `).all(tableNo);
}

// =====================================================
// MARK BILL ITEMS AS BILLED
// =====================================================

function markBillItemsBilled(tableNo, billId, billNo) {
  return db.prepare(`
    UPDATE pos_bill_items
    SET billed = 1,
        status = 'BILLED',
        billId = ?,
        billNo = ?
    WHERE tableNo = ?
      AND billed = 0
  `).run(billId, billNo, tableNo);
}



// =====================================================
// UPDATE BILL ITEM QUANTITY
// =====================================================

function updateBillItemQuantity({
  tableNo,
  billItemGroupKey,
  quantity,
}) {

  if (!tableNo) {
    throw new Error('tableNo is required');
  }

  const newQuantity =
    Number(quantity);

  if (!Number.isFinite(newQuantity)) {
    throw new Error('Invalid quantity');
  }


  // ---------------------------------------------------
  // ZERO = DELETE ITEM FROM BILL
  // ---------------------------------------------------

  if (newQuantity <= 0) {

    db.prepare(`
      DELETE FROM pos_bill_items

      WHERE tableNo = ?
        AND billItemGroupKey = ?
        AND billed = 0
        AND status = 'OPEN'
    `).run(
      tableNo,
      billItemGroupKey
    );

    return {
      success: true,
      quantity: 0,
      deleted: true,
    };
  }


  // ---------------------------------------------------
  // UPDATE QUANTITY
  // ---------------------------------------------------

  const result =
    db.prepare(`
      UPDATE pos_bill_items

      SET quantity = ?

      WHERE tableNo = ?
        AND billItemGroupKey = ?
        AND billed = 0
        AND status = 'OPEN'
    `).run(
      newQuantity,
      tableNo,
      billItemGroupKey
    );


  return {
    success: true,
    quantity: newQuantity,
    changed: result.changes,
  };
}



module.exports = {
   updateBillItemQuantity,
  insertBillItems,
  getOpenBillItems,
  markBillItemsBilled,
};