const { db } = require('./sqlite.cjs');

async function insertKotItems(items) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO pos_kot_items (
      id, kotNumber, categoryName, productMode, currentStock,
      sessionId, kotBatchId,
      tableNo, tableName,
      productId, name, categoryId,
      createdById, createdByName,
      parentId, isVariant,
      basePrice, finalPrice, modifierTotal, quantity,
      taxRate, taxType,
      status, note, modifiersJson,
      kitchenPrintReq, kitchenPrinted, createdAt,
      source, syncedToCloud, syncedFromCloud
    ) VALUES (
      @id, @kotNumber, @categoryName, @productMode, @currentStock,
      @sessionId, @kotBatchId,
      @tableNo, @tableName,
      @productId, @name, @categoryId,
      @createdById, @createdByName,
      @parentId, @isVariant,
      @basePrice, @finalPrice, @modifierTotal, @quantity,
      @taxRate, @taxType,
      @status, @note, @modifiersJson,
      @kitchenPrintReq, @kitchenPrinted, @createdAt,
      @source, @syncedToCloud, @syncedFromCloud
    )
  `);

  const tx = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        ...row,
        isVariant: row.isVariant ? 1 : 0,
        kitchenPrintReq: row.kitchenPrintReq ? 1 : 0,
        kitchenPrinted: row.kitchenPrinted ? 1 : 0,
        syncedToCloud: row.syncedToCloud ? 1 : 0,
        syncedFromCloud: row.syncedFromCloud ? 1 : 0,
      });
    }
  });

  tx(items);
}

async function getPendingKotByTable(tableNo) {
  return db.prepare(`
    SELECT * FROM pos_kot_items
    WHERE tableNo = ? AND status = 'PENDING'
    ORDER BY createdAt ASC
  `).all(tableNo);
}

async function getKotByBatch(kotBatchId) {
  return db.prepare(`
    SELECT * FROM pos_kot_items
    WHERE kotBatchId = ?
    ORDER BY createdAt ASC
  `).all(kotBatchId);
}

async function markKotPrinted(kotBatchId) {
  return db.prepare(`
    UPDATE pos_kot_items
    SET kitchenPrinted = 1
    WHERE kotBatchId = ?
  `).run(kotBatchId);
}

async function updateKotStatus(id, status) {
  return db.prepare(`
    UPDATE pos_kot_items
    SET status = ?
    WHERE id = ?
  `).run(status, id);
}

module.exports = {
  insertKotItems,
  getPendingKotByTable,
  getKotByBatch,
  markKotPrinted,
  updateKotStatus,
};