const { initDb } = require('./initDb.cjs');
const { db } = require('./sqlite.cjs');

// =====================================================
// DEBUG: SHOW ALL SQLITE TABLES
// Location: electron/db/cartRepo.cjs
// Run once when Electron starts
// =====================================================
console.log(
  'SQLITE TABLES =>',
  db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table'"
  ).all()
);

initDb();

async function addCartItem(item, tableNo) {
const productId = item.productId;

  if (!productId) {
    throw new Error('productId missing');
  }

  const note = item.note || '';
  const modifiersJson = JSON.stringify(
    item.modifiers || []
  );

  const existing = db
    .prepare(
      `SELECT id, quantity
       FROM pos_cart_item
       WHERE productId = ?
         AND tableId = ?
         AND note = ?
         AND modifiersJson = ?`
    )
    .get(
      productId,
      tableNo,
      note,
      modifiersJson
    );

  if (existing) {
    db.prepare(
      `UPDATE pos_cart_item
       SET quantity = quantity + 1
       WHERE id = ?`
    ).run(existing.id);
  } else {
    db.prepare(
      `INSERT INTO pos_cart_item (
        productId,
        productMode,
        currentStock,
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
        sessionId,
        tableId,
        tableName,
        createdById,
        createdByName,
        note,
        modifiersJson,
        sentToKitchen,
        kitchenPrintReq,
        printStatus,
        createdAt
      ) VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
      )`
    ).run(
      productId,
      item.productMode || 'raw_stock',
      item.currentStock || 0,
      item.name || '',
      item.categoryId || '',
      item.categoryName || '',
      item.parentId || null,
      item.isVariant ? 1 : 0,
      item.basePrice || item.price || 0,
      item.finalPrice || item.price || 0,
      item.modifierTotal || 0,
      item.quantity || 1,
      item.taxRate || 0,
      item.taxType || 'exclusive',
      item.sessionId || 'DEFAULT',
      tableNo || null,
      item.tableName || null,
      item.createdById || '',
      item.createdByName || '',
      note,
      modifiersJson,
      item.sentToKitchen ? 1 : 0,
      item.kitchenPrintReq ? 1 : 0,
      item.printStatus || 'PENDING',
      item.createdAt || Date.now()
    );
  }

  return getCartItems(tableNo);
}

async function getCartItems(tableNo) {
  const rows = db
    .prepare(
      'SELECT * FROM pos_cart_item WHERE tableId = ?'
    )
    .all(tableNo);

  console.log('SQLITE CART ROWS =>', rows);

  return rows;
}

async function removeCartItem(
  uniqueKey,
  tableNo,
  removeAll = false
) {
  if (removeAll) {
    db.prepare(
      'DELETE FROM pos_cart_item WHERE id = ?'
    ).run(uniqueKey);
  } else {
    const row = db
      .prepare(
        'SELECT quantity FROM pos_cart_item WHERE id = ?'
      )
      .get(uniqueKey);

    if (!row) return;

    if (row.quantity <= 1) {
      db.prepare(
        'DELETE FROM pos_cart_item WHERE id = ?'
      ).run(uniqueKey);
    } else {
      db.prepare(
        'UPDATE pos_cart_item SET quantity = quantity - 1 WHERE id = ?'
      ).run(uniqueKey);
    }
  }

  return getCartItems(tableNo);
}

async function clearCart(tableNo) {
  const result = db.prepare(
    'DELETE FROM pos_cart_item WHERE tableId = ?'
  ).run(tableNo);

  console.log(
    'CLEAR CART => table:',
    tableNo,
    'deleted rows:',
    result.changes
  );

  return [];
}

module.exports = {
  addCartItem,
  getCartItems,
  removeCartItem,
  clearCart,
};