const { db } = require('../db/sqlite.cjs');
 
const { adminDb } = require('../lib/firebaseAdmin.cjs');
const {
  TERMINAL_CODE,
  getFinancialYearCode,
} = require('../lib/orderSequence.cjs');

async function syncOrderCounter() {
  const financialYear =
    getFinancialYearCode();

  const docId =
    `${TERMINAL_CODE}_${financialYear}`;

  console.log(
    'ORDER COUNTER SYNC DOC =',
    docId
  );

  const snap = await adminDb
    .collection('orderCounters')
    .doc(docId)
    .get();

  if (!snap.exists) {
    console.log(
      'No order counter found in Firestore'
    );

    return {
      invoiceSerialNo: 0,
      source: 'empty',
    };
  }

  const invoiceSerialNo = Number(
    snap.get('invoiceSerialNo') || 0
  );

  db.prepare(`
    INSERT INTO order_counter (
      id,
      invoiceSerialNo,
      updatedAt
    ) VALUES (
      1,
      ?,
      ?
    )
    ON CONFLICT(id) DO UPDATE SET
      invoiceSerialNo = excluded.invoiceSerialNo,
      updatedAt = excluded.updatedAt
  `).run(
    invoiceSerialNo,
    Date.now()
  );

  console.log(
    'ORDER COUNTER DOWNLOADED =',
    invoiceSerialNo
  );

  return {
    invoiceSerialNo,
    source: 'firestore',
  };
}

module.exports = {
  syncOrderCounter,
};