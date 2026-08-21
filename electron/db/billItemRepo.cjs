const { db } = require('./sqlite.cjs');
const { randomUUID } = require('crypto');

// =====================================================
// INSERT BILL ITEMS
// =====================================================
function insertBillItems(items) {
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

      const normalizedModifiers =
        normalizeModifiersJson(item.modifiersJson);

      stmt.run({
        id: randomUUID(),

        billItemGroupKey: [
          item.tableNo ?? '',
          item.productId,
          item.note ?? '',
          normalizedModifiers,
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
        modifiersJson: normalizedModifiers,

        createdAt: Date.now(),
      });
    }
  });

  insertMany(items);

  return {
    success: true,
    count: items.length,
  };
}

function normalizeModifiersJson(value) {
  if (!value) {
    return '[]';
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return '[]';
    }

    return JSON.stringify(parsed);
  } catch {
    return value;
  }
}
// function insertBillItems(items) {

//   const stmt = db.prepare(`
//     INSERT INTO pos_bill_items (
//       id,
//       billItemGroupKey,
//       sessionId,
//       tableNo,
//       tableName,
//       productId,
//       name,
//       categoryId,
//       categoryName,
//       parentId,
//       isVariant,
//       basePrice,
//       finalPrice,
//       modifierTotal,
//       quantity,
//       taxRate,
//       taxType,
//       note,
//       modifiersJson,
//       status,
//       billed,
//       createdAt
//     ) VALUES (
//       @id,
//       @billItemGroupKey,
//       @sessionId,
//       @tableNo,
//       @tableName,
//       @productId,
//       @name,
//       @categoryId,
//       @categoryName,
//       @parentId,
//       @isVariant,
//       @basePrice,
//       @finalPrice,
//       @modifierTotal,
//       @quantity,
//       @taxRate,
//       @taxType,
//       @note,
//       @modifiersJson,
//       'OPEN',
//       0,
//       @createdAt
//     )
//   `);

//   // =====================================================
//   // DEBUG: FIND EXISTING BILL ITEMS
//   // =====================================================

//   const findExisting = db.prepare(`
//     SELECT
//       id,
//       billItemGroupKey,
//       tableNo,
//       productId,
//       name,
//       note,
//       modifiersJson,
//       quantity,
//       basePrice,
//       finalPrice,
//       modifierTotal,
//       taxRate,
//       taxType,
//       status,
//       billed
//     FROM pos_bill_items

//     WHERE tableNo = ?
//       AND productId = ?
//       AND billed = 0
//       AND status = 'OPEN'
//   `);


//   const insertMany = db.transaction((rows) => {

//     for (const item of rows) {

//       // =================================================
//       // BUILD INCOMING GROUP KEY
//       // =================================================

//       const incomingGroupKey = [
//         item.tableNo ?? '',
//         item.productId,
//         item.note ?? '',
//         item.modifiersJson ?? '',
//       ].join('|');


//       // =================================================
//       // DEBUG INCOMING ITEM
//       // =================================================

//       console.log(
//         '=============================================='
//       );

//       console.log(
//         'INSERT BILL ITEM - INCOMING WAITER/POS ITEM'
//       );

//       console.log(
//         'INCOMING ITEM:',
//         item
//       );

//       console.log(
//         'INCOMING ITEM JSON:',
//         JSON.stringify(
//           item,
//           null,
//           2
//         )
//       );

//       console.log(
//         'INCOMING GROUP KEY:',
//         incomingGroupKey
//       );


//       // =================================================
//       // FIND EXISTING ITEMS FOR SAME TABLE + PRODUCT
//       // =================================================

//       const existingRows =
//         findExisting.all(
//           item.tableNo ?? '',
//           item.productId
//         );


//       console.log(
//         'EXISTING DB ROWS FOR SAME TABLE + PRODUCT:',
//         existingRows
//       );


//       // =================================================
//       // COMPARE
//       // =================================================

//       if (existingRows.length > 0) {

//         for (const existing of existingRows) {

//           console.log(
//             '---------- GROUP KEY COMPARISON ----------'
//           );

//           console.log(
//             'INCOMING:',
//             {
//               tableNo:
//                 item.tableNo ?? '',

//               productId:
//                 item.productId,

//               note:
//                 item.note ?? '',

//               modifiersJson:
//                 item.modifiersJson ?? '',

//               groupKey:
//                 incomingGroupKey,
//             }
//           );

//           console.log(
//             'EXISTING:',
//             {
//               tableNo:
//                 existing.tableNo,

//               productId:
//                 existing.productId,

//               name:
//                 existing.name,

//               note:
//                 existing.note,

//               modifiersJson:
//                 existing.modifiersJson,

//               groupKey:
//                 existing.billItemGroupKey,
//             }
//           );


//           console.log(
//             'GROUP KEY SAME?:',
//             existing.billItemGroupKey ===
//             incomingGroupKey
//           );


//           // Individual comparisons

//           console.log(
//             'TABLE SAME?:',
//             existing.tableNo ===
//             (item.tableNo ?? '')
//           );

//           console.log(
//             'PRODUCT ID SAME?:',
//             existing.productId ===
//             item.productId
//           );

//           console.log(
//             'NOTE SAME?:',
//             existing.note ===
//             (item.note ?? '')
//           );

//           console.log(
//             'MODIFIERS SAME?:',
//             existing.modifiersJson ===
//             (item.modifiersJson ?? '')
//           );
//         }
//       }


//       console.log(
//         '=============================================='
//       );


//       // =================================================
//       // INSERT
//       // =================================================

//       stmt.run({

//         id:
//           randomUUID(),

//         billItemGroupKey:
//           incomingGroupKey,

//         sessionId:
//           item.sessionId ?? '',

//         tableNo:
//           item.tableNo ?? '',

//         tableName:
//           item.tableName ?? '',

//         productId:
//           item.productId,

//         name:
//           item.name,

//         categoryId:
//           item.categoryId,

//         categoryName:
//           item.categoryName ?? '',

//         parentId:
//           item.parentId ?? null,

//         isVariant:
//           item.isVariant ? 1 : 0,

//         basePrice:
//           item.basePrice,

//         finalPrice:
//           item.finalPrice ??
//           item.basePrice,

//         modifierTotal:
//           item.modifierTotal ?? 0,

//         quantity:
//           item.quantity,

//         taxRate:
//           item.taxRate ?? 0,

//         taxType:
//           item.taxType ??
//           'exclusive',

//         note:
//           item.note ?? '',

//         modifiersJson:
//           item.modifiersJson ?? '',

//         createdAt:
//           Date.now(),
//       });
//     }
//   });


//   insertMany(items);


//   return {
//     success: true,
//     count: items.length,
//   };
// }

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