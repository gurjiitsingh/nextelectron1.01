module.exports = function createBillItemsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bill_items (
      id TEXT PRIMARY KEY,
      billItemGroupKey TEXT NOT NULL,

      sessionId TEXT,
      tableNo TEXT,
      tableName TEXT,

      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      categoryName TEXT NOT NULL,

      parentId TEXT,
      isVariant INTEGER NOT NULL DEFAULT 0,

      basePrice REAL NOT NULL,
      finalPrice REAL NOT NULL,
      modifierTotal REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL,

      taxRate REAL NOT NULL DEFAULT 0,
      taxType TEXT NOT NULL DEFAULT 'exclusive',

      note TEXT DEFAULT '',
      modifiersJson TEXT DEFAULT '',

      status TEXT NOT NULL DEFAULT 'OPEN',
      billed INTEGER NOT NULL DEFAULT 0,

      billId TEXT,
      billNo TEXT,

      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bill_items_table
      ON bill_items(tableNo);

    CREATE INDEX IF NOT EXISTS idx_bill_items_status
      ON bill_items(status, billed);
  `);
};