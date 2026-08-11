-- =====================================================
-- CATEGORIES (matches Android CategoryEntity)
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,
  desc TEXT NOT NULL,
  image TEXT,

  taxRate REAL,
  taxType TEXT,

  sortOrder INTEGER NOT NULL DEFAULT 0,
  slug TEXT,
  isFeatured INTEGER NOT NULL DEFAULT 0,
  kitchenPrintReq INTEGER,
  updatedAt INTEGER,
  isDeleted INTEGER NOT NULL DEFAULT 0,
  outletId TEXT
);

CREATE INDEX IF NOT EXISTS idx_categories_name
ON categories(name);

-- =====================================================
-- PRODUCTS (matches Android ProductEntity)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,

  searchCode TEXT,

  name TEXT NOT NULL,
  price REAL NOT NULL,
  discountPrice REAL,
  image TEXT,

  foodType TEXT,

  sortOrder INTEGER NOT NULL DEFAULT 0,
  kitchenPrintReq INTEGER,

  categoryId TEXT NOT NULL,
  productCat TEXT NOT NULL,

  parentId TEXT,
  baseProductId TEXT,

  hasVariants INTEGER NOT NULL DEFAULT 0,
  hasModifiers INTEGER NOT NULL DEFAULT 0,

  currentStock REAL,

  productMode TEXT DEFAULT 'raw_stock',

  taxRate REAL,
  taxType TEXT,

  type TEXT,

  outletId TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_name
ON products(name);

CREATE INDEX IF NOT EXISTS idx_products_category
ON products(categoryId);

CREATE INDEX IF NOT EXISTS idx_products_searchCode
ON products(searchCode);

CREATE INDEX IF NOT EXISTS idx_products_sort
ON products(sortOrder, name);

CREATE INDEX IF NOT EXISTS idx_products_foodType
ON products(foodType);

-- =====================================================
-- CART ITEMS
-- =====================================================



DROP TABLE IF EXISTS pos_cart_item;

CREATE TABLE IF NOT EXISTS pos_cart_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  productId TEXT NOT NULL,
  productMode TEXT NOT NULL,
  currentStock REAL NOT NULL DEFAULT 0,

  name TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  categoryName TEXT NOT NULL,

  parentId TEXT,
  isVariant INTEGER NOT NULL,

  basePrice REAL NOT NULL,
  finalPrice REAL NOT NULL DEFAULT 0,
  modifierTotal REAL NOT NULL DEFAULT 0,

  quantity INTEGER NOT NULL,

  taxRate REAL NOT NULL DEFAULT 0,
  taxType TEXT NOT NULL DEFAULT 'exclusive',

  sessionId TEXT NOT NULL,

  tableId TEXT,
  tableName TEXT,

  createdById TEXT NOT NULL DEFAULT '',
  createdByName TEXT NOT NULL DEFAULT '',

  note TEXT NOT NULL DEFAULT '',
  modifiersJson TEXT NOT NULL DEFAULT '',

  sentToKitchen INTEGER NOT NULL DEFAULT 0,
  kitchenPrintReq INTEGER NOT NULL DEFAULT 0,
  printStatus TEXT NOT NULL DEFAULT 'PENDING',

  createdAt INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_unique
ON pos_cart_item(productId, tableId, note, modifiersJson);


-- =====================================================
-- MODIFIER GROUPS (matches Android ModifierGroupEntity)
-- =====================================================

CREATE TABLE IF NOT EXISTS modifier_groups (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,

  minSelection INTEGER NOT NULL,
  maxSelection INTEGER NOT NULL,

  sortOrder INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_sort
ON modifier_groups(sortOrder, name);


-- =====================================================
-- MODIFIER ITEMS (matches Android ModifierItemEntity)
-- =====================================================

CREATE TABLE IF NOT EXISTS modifier_items (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,

  groupId TEXT NOT NULL,

  price REAL NOT NULL,

  isDefault INTEGER NOT NULL DEFAULT 0,

  sortOrder INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_modifier_items_group
ON modifier_items(groupId);

CREATE INDEX IF NOT EXISTS idx_modifier_items_sort
ON modifier_items(groupId, sortOrder, name);

-- =====================================================
-- PRODUCT MODIFIERS (matches Android ProductModifierEntity)
-- =====================================================

CREATE TABLE IF NOT EXISTS product_modifiers (
  id TEXT PRIMARY KEY,

  productId TEXT NOT NULL,

  groupId TEXT NOT NULL,

  sortOrder INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_modifiers_product
ON product_modifiers(productId);

CREATE INDEX IF NOT EXISTS idx_product_modifiers_group
ON product_modifiers(groupId);

CREATE INDEX IF NOT EXISTS idx_product_modifiers_sort
ON product_modifiers(productId, sortOrder);




CREATE TABLE IF NOT EXISTS pos_kot_items (
  id TEXT PRIMARY KEY,
  kotNumber TEXT NOT NULL,
  categoryName TEXT NOT NULL,
  productMode TEXT NOT NULL,
  currentStock REAL DEFAULT 0,

  sessionId TEXT,
  kotBatchId TEXT NOT NULL,

  tableNo TEXT,
  tableName TEXT,

  productId TEXT NOT NULL,
  name TEXT NOT NULL,
  categoryId TEXT NOT NULL,

  createdById TEXT DEFAULT '',
  createdByName TEXT DEFAULT '',

  parentId TEXT,
  isVariant INTEGER NOT NULL DEFAULT 0,

  basePrice REAL NOT NULL,
  finalPrice REAL NOT NULL DEFAULT 0,
  modifierTotal REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL,

  taxRate REAL NOT NULL DEFAULT 0,
  taxType TEXT NOT NULL DEFAULT 'exclusive',

  status TEXT NOT NULL DEFAULT 'PENDING',
  note TEXT DEFAULT '',
  modifiersJson TEXT DEFAULT '',

  kitchenPrintReq INTEGER NOT NULL DEFAULT 1,
  kitchenPrinted INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL,

  source TEXT NOT NULL DEFAULT 'POS',

  syncedToCloud INTEGER NOT NULL DEFAULT 0,
  syncedFromCloud INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_kot_batch
ON pos_kot_items(kotBatchId);

CREATE INDEX IF NOT EXISTS idx_kot_session
ON pos_kot_items(sessionId);

CREATE INDEX IF NOT EXISTS idx_kot_table
ON pos_kot_items(tableNo);

CREATE INDEX IF NOT EXISTS idx_kot_product
ON pos_kot_items(productId);

CREATE INDEX IF NOT EXISTS idx_kot_synced
ON pos_kot_items(syncedToCloud);

CREATE INDEX IF NOT EXISTS idx_kot_source
ON pos_kot_items(source);