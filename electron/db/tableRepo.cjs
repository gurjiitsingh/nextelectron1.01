const { db } = require('./sqlite.cjs');

// =====================================================
// CLEAR TABLES
// =====================================================

function clearTables() {
  db.prepare('DELETE FROM tables').run();
}

// =====================================================
// INSERT TABLES
// =====================================================

function insertTables(list) {

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO tables (
      id,
      tableName,
      status,
      waiterName,
      waiterId,
      activeOrderId,
      guestsCount,
      area,
      sortOrder,
      cartCount,
      kitchenCount,
      billCount,
      billAmount,
      updatedAt,
      createdAt,
      notes,
      synced
    ) VALUES (
      @id,
      @tableName,
      @status,
      @waiterName,
      @waiterId,
      @activeOrderId,
      @guestsCount,
      @area,
      @sortOrder,
      @cartCount,
      @kitchenCount,
      @billCount,
      @billAmount,
      @updatedAt,
      @createdAt,
      @notes,
      @synced
    )
  `);

  const tx = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        tableName: row.tableName,
        status: row.status ?? 'AVAILABLE',
        waiterName: row.waiterName ?? null,
        waiterId: row.waiterId ?? null,
        activeOrderId: row.activeOrderId ?? null,
        guestsCount: row.guestsCount ?? null,
        area: row.area ?? 'General',
        sortOrder: row.sortOrder ?? 0,
        cartCount: row.cartCount ?? 0,
        kitchenCount: row.kitchenCount ?? 0,
        billCount: row.billCount ?? 0,
        billAmount: row.billAmount ?? 0,
        updatedAt: row.updatedAt ?? null,
        createdAt: row.createdAt ?? null,
        notes: row.notes ?? null,
        synced: row.synced ? 1 : 0,
      });
    }
  });

  tx(list);
}

// =====================================================
// GET ALL TABLES
// =====================================================

function getAllTables() {
  return db.prepare(`
    SELECT *
    FROM tables
    ORDER BY area ASC, sortOrder ASC, tableName ASC
  `).all();
}

module.exports = {
  clearTables,
  insertTables,
  getAllTables,
};