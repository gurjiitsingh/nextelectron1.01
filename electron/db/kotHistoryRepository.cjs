const { db } = require('./sqlite.cjs');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}


// =====================================================
// CREATE KOT HISTORY
// =====================================================

function createKotHistory({
  kotNumber,
  tableNo,
  tableName = '',
  orderType = 'DINE_IN',
  source = 'POS',

  businessDate,

  deviceId = 'POS',
  deviceName = 'Electron POS',
  appVersion = '1.0',

  items = [],
}) {

  if (!kotNumber) {
    throw new Error('kotNumber is required');
  }

  if (!tableNo) {
    throw new Error('tableNo is required');
  }

  if (!businessDate) {
    throw new Error('businessDate is required');
  }

  const now = Date.now();

  const kotHistoryId = uuid();

  const transaction = db.transaction(() => {

    // =================================================
    // 1. HEADER
    // =================================================

    db.prepare(`
      INSERT INTO pos_kot_history (

        id,

        kotNumber,

        tableNo,
        tableName,

        orderType,
        source,

        status,

        businessDate,

        createdAt,
        completedAt,

        deletedAt,
        deletedById,
        deletedByName,

        deviceId,
        deviceName,
        appVersion,

        syncStatus,
        lastSyncedAt

      ) VALUES (

        @id,

        @kotNumber,

        @tableNo,
        @tableName,

        @orderType,
        @source,

        'OPEN',

        @businessDate,

        @createdAt,
        NULL,

        NULL,
        NULL,
        NULL,

        @deviceId,
        @deviceName,
        @appVersion,

        'PENDING',
        NULL

      )
    `).run({

      id:
        kotHistoryId,

      kotNumber,

      tableNo,

      tableName:
        tableName || '',

      orderType,

      source,

      businessDate,

      createdAt:
        now,

      deviceId,

      deviceName,

      appVersion,
    });


    // =================================================
    // 2. ITEMS
    // =================================================

    const insertItem =
      db.prepare(`
        INSERT INTO pos_kot_history_items (

          id,

          kotHistoryId,
          kotNumber,

          tableNo,

          productId,

          name,

          categoryId,
          categoryName,

          parentId,
          isVariant,

          productMode,

          basePrice,
          quantity,

          modifierPrice,
          modifierSummary,
          modifiersJson,

          note,

          taxRate,
          taxType,

          taxAmountPerItem,
          taxTotal,

          finalPricePerItem,
          finalTotal,

          status,

          source,

          createdAt,
          deletedAt,

          syncStatus,
          lastSyncedAt

        ) VALUES (

          @id,

          @kotHistoryId,
          @kotNumber,

          @tableNo,

          @productId,

          @name,

          @categoryId,
          @categoryName,

          @parentId,
          @isVariant,

          @productMode,

          @basePrice,
          @quantity,

          @modifierPrice,
          @modifierSummary,
          @modifiersJson,

          @note,

          @taxRate,
          @taxType,

          @taxAmountPerItem,
          @taxTotal,

          @finalPricePerItem,
          @finalTotal,

          'ACTIVE',

          @source,

          @createdAt,
          NULL,

          'PENDING',
          NULL

        )
      `);


    for (const item of items) {

      insertItem.run({

        id:
          uuid(),

        kotHistoryId,

        kotNumber,

        tableNo,

        productId:
          item.productId || '',

        name:
          item.name || '',

        categoryId:
          item.categoryId || '',

        categoryName:
          item.categoryName || '',

        parentId:
          item.parentId || null,

        isVariant:
          item.isVariant ? 1 : 0,

        productMode:
          item.productMode || 'raw_stock',

        basePrice:
          Number(item.basePrice || 0),

        quantity:
          Number(item.quantity || 0),

        modifierPrice:
          Number(item.modifierPrice || 0),

        modifierSummary:
          item.modifierSummary || '',

        modifiersJson:
          item.modifiersJson || '',

        note:
          item.note || '',

        taxRate:
          Number(item.taxRate || 0),

        taxType:
          item.taxType || 'exclusive',

        taxAmountPerItem:
          Number(item.taxAmountPerItem || 0),

        taxTotal:
          Number(item.taxTotal || 0),

        finalPricePerItem:
          Number(item.finalPricePerItem || 0),

        finalTotal:
          Number(item.finalTotal || 0),

        source:
          item.source || source,

        createdAt:
          now,
      });
    }

  });

  transaction();

  return {
    success: true,
    id: kotHistoryId,
    kotNumber,
  };
}


// =====================================================
// GET KOT HISTORY
// =====================================================

function getKotHistory({
  businessDate = null,
} = {}) {

  if (businessDate) {

    return db.prepare(`
      SELECT *
      FROM pos_kot_history
      WHERE businessDate = ?
      ORDER BY createdAt DESC
    `).all(businessDate);

  }

  return db.prepare(`
    SELECT *
    FROM pos_kot_history
    ORDER BY createdAt DESC
  `).all();
}


// =====================================================
// GET KOT HISTORY DETAIL
// =====================================================

function getKotHistoryDetail(
  kotHistoryId
) {

  const kot =
    db.prepare(`
      SELECT *
      FROM pos_kot_history
      WHERE id = ?
    `).get(kotHistoryId);

  if (!kot) {
    return null;
  }

  const items =
    db.prepare(`
      SELECT *
      FROM pos_kot_history_items
      WHERE kotHistoryId = ?
      ORDER BY createdAt ASC
    `).all(kotHistoryId);

  return {
    ...kot,
    items,
  };
}


// =====================================================
// MARK HISTORY ITEM DELETED
// =====================================================

function markHistoryItemDeleted({
  kotHistoryId,
  productId,
  deletedById = '',
  deletedByName = '',
}) {

  const now = Date.now();

  const transaction = db.transaction(() => {

    db.prepare(`
      UPDATE pos_kot_history_items

      SET
        status = 'DELETED',
        deletedAt = ?,
        syncStatus = 'PENDING'

      WHERE kotHistoryId = ?
        AND productId = ?
        AND status = 'ACTIVE'
    `).run(
      now,
      kotHistoryId,
      productId
    );


    updateKotHistoryStatus(
      kotHistoryId
    );

  });

  transaction();

  return {
    success: true,
  };
}


// =====================================================
// UPDATE KOT HISTORY STATUS
// =====================================================

function updateKotHistoryStatus(
  kotHistoryId
) {

  const counts =
    db.prepare(`
      SELECT

        COUNT(*) AS total,

        SUM(
          CASE
            WHEN status = 'ACTIVE'
            THEN 1
            ELSE 0
          END
        ) AS active,

        SUM(
          CASE
            WHEN status = 'DELETED'
            THEN 1
            ELSE 0
          END
        ) AS deleted

      FROM pos_kot_history_items

      WHERE kotHistoryId = ?
    `).get(kotHistoryId);


  let status = 'OPEN';


  if (
    counts.total > 0 &&
    counts.deleted === counts.total
  ) {

    status = 'DELETED';

  } else if (
    counts.deleted > 0
  ) {

    status = 'PARTIAL';

  }


  db.prepare(`
    UPDATE pos_kot_history

    SET
      status = ?,
      syncStatus = 'PENDING'

    WHERE id = ?
  `).run(
    status,
    kotHistoryId
  );

  return status;
}


// =====================================================
// MARK KOT PAID
// =====================================================

function markKotHistoryPaid(
  kotHistoryId
) {

  const now = Date.now();

  const transaction = db.transaction(() => {

    db.prepare(`
      UPDATE pos_kot_history_items

      SET
        status = 'PAID',
        syncStatus = 'PENDING'

      WHERE kotHistoryId = ?
        AND status = 'ACTIVE'
    `).run(kotHistoryId);


    db.prepare(`
      UPDATE pos_kot_history

      SET
        status = 'PAID',
        completedAt = ?,
        syncStatus = 'PENDING'

      WHERE id = ?
    `).run(
      now,
      kotHistoryId
    );

  });

  transaction();

  return {
    success: true,
  };
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  createKotHistory,

  getKotHistory,

  getKotHistoryDetail,

  markHistoryItemDeleted,

  updateKotHistoryStatus,

  markKotHistoryPaid,

};