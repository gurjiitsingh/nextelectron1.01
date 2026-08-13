const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(
  process.cwd(),
  'pos-local.db'
);

// Create database connection
const db = new Database(dbPath);

// Optional pragmas
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// =====================================================
// DEBUG COUNTS
// =====================================================

function getDebugCounts() {
  return {
    categories: db
      .prepare('SELECT COUNT(*) as c FROM categories')
      .get().c,

    products: db
      .prepare('SELECT COUNT(*) as c FROM products')
      .get().c,

    modifier_groups: db
      .prepare('SELECT COUNT(*) as c FROM modifier_groups')
      .get().c,

    modifier_items: db
      .prepare('SELECT COUNT(*) as c FROM modifier_items')
      .get().c,

    product_modifiers: db
      .prepare('SELECT COUNT(*) as c FROM product_modifiers')
      .get().c,

    cart: db
      .prepare('SELECT COUNT(*) as c FROM pos_cart_item')
      .get().c,
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  db,
  getDebugCounts,
};