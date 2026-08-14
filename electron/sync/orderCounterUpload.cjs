const { db } = require('../db/sqlite.cjs');
const { adminDb } = require('../lib/firebaseAdmin.cjs');
const {
  TERMINAL_CODE,
  getFinancialYearCode,
} = require('../lib/orderSequence.cjs');

async function uploadOrderCounter() {

  const row = db.prepare(`
    SELECT invoiceSerialNo
    FROM order_counter
    WHERE id = 1
  `).get();

  const localSerial =
    Number(row?.invoiceSerialNo || 0);

  if (localSerial <= 0) return;

  const financialYear =
    getFinancialYearCode();

  const docId =
    `${TERMINAL_CODE}_${financialYear}`;

  const ref = adminDb
    .collection('orderCounters')
    .doc(docId);

  const snap = await ref.get();

  const remoteSerial =
    snap.exists
      ? Number(snap.get('invoiceSerialNo') || 0)
      : 0;

  // Only move forward
  if (localSerial > remoteSerial) {

    await ref.set({
      invoiceSerialNo: localSerial,
      deviceCode: TERMINAL_CODE,
      financialYear,
      updatedAt: Date.now(),
    }, { merge: true });

    console.log(
      'ORDER COUNTER UPLOADED =',
      localSerial
    );
  } else {
    console.log(
      'ORDER COUNTER ALREADY UP TO DATE'
    );
  }
}

module.exports = {
  uploadOrderCounter,
};