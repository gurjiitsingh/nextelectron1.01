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


function generateNextKotNumber() {
  const transaction = db.transaction(() => {

    const row = db.prepare(`
      SELECT nextNumber
      FROM pos_kot_sequence
      WHERE id = 1
    `).get();

    if (!row) {
      throw new Error(
        'KOT sequence is not initialized'
      );
    }

    const number = Number(row.nextNumber);

    if (!Number.isInteger(number) || number < 1) {
      throw new Error(
        `Invalid KOT sequence number: ${row.nextNumber}`
      );
    }

    db.prepare(`
      UPDATE pos_kot_sequence
      SET nextNumber = ?
      WHERE id = 1
    `).run(number + 1);

    return `K${number}`;
  });

  return transaction();
}

function insertKotBatch(batch) {

  const stmt = db.prepare(`
    INSERT INTO pos_kot_batch (
      id,
      kotNumber,
      sessionId,
      tableNo,
      tableName,
      orderType,
      deviceId,
      deviceName,
      appVersion,
      createdAt,
      sentBy,
      syncStatus,
      lastSyncedAt
    )
    VALUES (
      @id,
      @kotNumber,
      @sessionId,
      @tableNo,
      @tableName,
      @orderType,
      @deviceId,
      @deviceName,
      @appVersion,
      @createdAt,
      @sentBy,
      @syncStatus,
      @lastSyncedAt
    )
  `);

  stmt.run({
    id:
      batch.id,

    kotNumber:
      batch.kotNumber,

    sessionId:
      batch.sessionId ?? null,

    tableNo:
      batch.tableNo ?? null,

    tableName:
      batch.tableName ?? null,

    orderType:
      batch.orderType ?? 'DINE_IN',

    deviceId:
      batch.deviceId ?? null,

    deviceName:
      batch.deviceName ?? null,

    appVersion:
      batch.appVersion ?? null,

    createdAt:
      batch.createdAt ?? Date.now(),

    sentBy:
      batch.sentBy ?? null,

    syncStatus:
      batch.syncStatus ?? 'PENDING',

    lastSyncedAt:
      batch.lastSyncedAt ?? null,
  });

  return {
    success: true,
    id: batch.id,
    kotNumber: batch.kotNumber,
  };
}

module.exports = {
  generateNextKotNumber,
  insertKotBatch,
  insertKotItems,
  getPendingKotByTable,
  getKotByBatch,
  markKotPrinted,
  updateKotStatus,
};