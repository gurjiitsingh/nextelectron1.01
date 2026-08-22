const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');

// Make sure the directory exists
fs.mkdirSync(userDataPath, { recursive: true });

const dbPath = path.join(userDataPath, 'pos.db');

console.log('====================================');
console.log('SQLITE DATABASE PATH:');
console.log(dbPath);
console.log('====================================');

const db = new Database(dbPath);

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