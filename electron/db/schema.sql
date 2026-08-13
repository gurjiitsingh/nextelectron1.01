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

-- =====================================================
-- POS BILL
--  
-- =====================================================

CREATE TABLE IF NOT EXISTS pos_bill_items (
  id TEXT PRIMARY KEY,

  -- Linking
  billItemGroupKey TEXT,
  sessionId TEXT,
  tableNo TEXT,
  tableName TEXT,

  -- Product
  productId TEXT NOT NULL,
  name TEXT NOT NULL,
  categoryId TEXT NOT NULL,
  categoryName TEXT NOT NULL,

  -- Variant
  parentId TEXT,
  isVariant INTEGER NOT NULL DEFAULT 0,

  -- Pricing
  basePrice REAL NOT NULL,
  finalPrice REAL NOT NULL DEFAULT 0,
  modifierTotal REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL,

  -- Tax
  taxRate REAL NOT NULL DEFAULT 0,
  taxType TEXT NOT NULL DEFAULT 'exclusive',

  -- Notes / modifiers
  note TEXT DEFAULT '',
  modifiersJson TEXT DEFAULT '',

  -- Billing status
  status TEXT NOT NULL DEFAULT 'OPEN',
  billed INTEGER NOT NULL DEFAULT 0,
  billNo TEXT DEFAULT '',
  billId TEXT DEFAULT '',

  createdAt INTEGER NOT NULL,

  -- Source
  source TEXT NOT NULL DEFAULT 'POS',

  syncedToCloud INTEGER NOT NULL DEFAULT 0,
  syncedFromCloud INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bill_items_table
ON pos_bill_items(tableNo);

CREATE INDEX IF NOT EXISTS idx_bill_items_status
ON pos_bill_items(status);

CREATE INDEX IF NOT EXISTS idx_bill_items_billed
ON pos_bill_items(billed);
-- =====================================================
-- POS ORDER MASTER
-- Matches Android PosOrderMasterEntity
-- =====================================================

CREATE TABLE IF NOT EXISTS pos_order_master (

  -- =====================================================
  -- CORE IDENTIFIERS
  -- =====================================================

  id TEXT PRIMARY KEY,

  srno TEXT NOT NULL,

  orderType TEXT NOT NULL,

  tableNo TEXT,

  saleType TEXT DEFAULT '',

  reason TEXT DEFAULT '',


  -- =====================================================
  -- CUSTOMER SNAPSHOT
  -- =====================================================

  customerName TEXT,

  customerPhone TEXT,

  customerId TEXT,


  -- =====================================================
  -- USER SNAPSHOT
  -- =====================================================

  createdById TEXT DEFAULT '',

  createdByName TEXT DEFAULT '',

  finalizedById TEXT DEFAULT '',

  finalizedByName TEXT DEFAULT '',


  -- =====================================================
  -- DELIVERY ADDRESS SNAPSHOT
  -- =====================================================

  dAddressLine1 TEXT,

  dAddressLine2 TEXT,

  dCity TEXT,

  dState TEXT,

  dZipcode TEXT,

  dLandmark TEXT,


  -- =====================================================
  -- AMOUNTS
  -- =====================================================

  deliveryFee REAL NOT NULL DEFAULT 0,

  deliveryTax REAL NOT NULL DEFAULT 0,

  itemTotal REAL NOT NULL DEFAULT 0,

  itemTax REAL NOT NULL DEFAULT 0,

  taxTotal REAL NOT NULL DEFAULT 0,

  discountTotal REAL NOT NULL DEFAULT 0,

  grandTotal REAL NOT NULL DEFAULT 0,


  -- =====================================================
  -- PAYMENT
  -- =====================================================

  paymentMode TEXT NOT NULL,

  paymentStatus TEXT NOT NULL,

  paidAmount REAL NOT NULL DEFAULT 0,

  dueAmount REAL NOT NULL DEFAULT 0,


  -- =====================================================
  -- ORDER STATE
  -- =====================================================

  orderStatus TEXT NOT NULL,


  -- =====================================================
  -- SOURCE & DEVICE META
  -- =====================================================

  source TEXT NOT NULL DEFAULT 'POS',

  deviceId TEXT NOT NULL,

  deviceName TEXT,

  appVersion TEXT,


  -- =====================================================
  -- TIMING
  -- =====================================================

  businessDate TEXT NOT NULL,

  createdAt INTEGER NOT NULL,

  updatedAt INTEGER,


  -- =====================================================
  -- SYNC CONTROL
  -- =====================================================

  syncStatus TEXT NOT NULL,

  lastSyncedAt INTEGER,


  -- =====================================================
  -- EXTRA
  -- =====================================================

  notes TEXT
);


-- =====================================================
-- INDEXES
-- Matches Android Room indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pos_order_master_syncStatus
ON pos_order_master(syncStatus);

CREATE INDEX IF NOT EXISTS idx_pos_order_master_createdAt
ON pos_order_master(createdAt);

CREATE INDEX IF NOT EXISTS idx_pos_order_master_orderType
ON pos_order_master(orderType);

CREATE INDEX IF NOT EXISTS idx_pos_order_master_businessDate
ON pos_order_master(businessDate);

CREATE INDEX IF NOT EXISTS idx_pos_order_master_tableNo
ON pos_order_master(tableNo);

CREATE INDEX IF NOT EXISTS idx_pos_order_master_srno
ON pos_order_master(srno);





 
-- =====================================================
-- POS ORDER ITEMS
-- Matches Android PosOrderItemEntity
-- =====================================================

CREATE TABLE IF NOT EXISTS pos_order_items (

  id TEXT PRIMARY KEY,

  categoryName TEXT NOT NULL,
  productMode TEXT NOT NULL,
  currentStock REAL NOT NULL DEFAULT 0,

  orderMasterId TEXT NOT NULL,
  productId TEXT NOT NULL,

  createdById TEXT NOT NULL DEFAULT '',
  createdByName TEXT NOT NULL DEFAULT '',

  name TEXT NOT NULL,
  categoryId TEXT NOT NULL,

  parentId TEXT,
  isVariant INTEGER NOT NULL DEFAULT 0,

  basePrice REAL NOT NULL,
  quantity INTEGER NOT NULL,
  itemSubtotal REAL NOT NULL DEFAULT 0,

  currency TEXT,
  paymentStatus TEXT,

  taxRate REAL NOT NULL DEFAULT 0,
  taxType TEXT NOT NULL DEFAULT 'exclusive',

  taxAmountPerItem REAL NOT NULL DEFAULT 0,
  taxTotal REAL NOT NULL DEFAULT 0,

  note TEXT NOT NULL DEFAULT '',
  modifiersJson TEXT NOT NULL DEFAULT '',
  modifierPrice REAL NOT NULL DEFAULT 0,
  modifierSummary TEXT NOT NULL DEFAULT '',

  finalPricePerItem REAL NOT NULL DEFAULT 0,
  finalTotal REAL NOT NULL DEFAULT 0,

  source TEXT NOT NULL DEFAULT 'POS',

  createdAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_orderMasterId
ON pos_order_items(orderMasterId);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_productId
ON pos_order_items(productId);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_parentId
ON pos_order_items(parentId);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_createdAt
ON pos_order_items(createdAt);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_categoryName
ON pos_order_items(categoryName);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_paymentStatus
ON pos_order_items(paymentStatus);

CREATE INDEX IF NOT EXISTS idx_pos_order_items_paymentStatus_createdAt
ON pos_order_items(paymentStatus, createdAt);


-- =====================================================
-- POS ORDER PAYMENTS
-- Matches Android PosOrderPaymentEntity
-- =====================================================

CREATE TABLE IF NOT EXISTS pos_order_payments (

  id TEXT PRIMARY KEY,

  orderId TEXT NOT NULL,

  ownerId TEXT NOT NULL,
  outletId TEXT NOT NULL,

  amount REAL NOT NULL,

  mode TEXT NOT NULL,

  provider TEXT,
  method TEXT,

  status TEXT NOT NULL,

  deviceId TEXT NOT NULL,

  createdAt INTEGER NOT NULL,

  businessDate TEXT NOT NULL,

  syncStatus TEXT NOT NULL DEFAULT 'PENDING',

  lastSyncedAt INTEGER,

  isVoided INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pos_order_payments_orderId
ON pos_order_payments(orderId);

CREATE INDEX IF NOT EXISTS idx_pos_order_payments_syncStatus
ON pos_order_payments(syncStatus);
 





CREATE TABLE IF NOT EXISTS order_master (
  id TEXT PRIMARY KEY,
  srno TEXT NOT NULL,
  orderType TEXT NOT NULL,
  tableNo TEXT,

  saleType TEXT DEFAULT '',
  reason TEXT DEFAULT '',

  customerName TEXT,
  customerPhone TEXT,
  customerId TEXT,

  createdById TEXT DEFAULT '',
  createdByName TEXT DEFAULT '',
  finalizedById TEXT DEFAULT '',
  finalizedByName TEXT DEFAULT '',

  dAddressLine1 TEXT,
  dAddressLine2 TEXT,
  dCity TEXT,
  dState TEXT,
  dZipcode TEXT,
  dLandmark TEXT,

  deliveryFee REAL DEFAULT 0,
  deliveryTax REAL DEFAULT 0,

  itemTotal REAL NOT NULL,
  itemTax REAL DEFAULT 0,
  taxTotal REAL NOT NULL,
  discountTotal REAL NOT NULL,
  grandTotal REAL NOT NULL,

  paymentMode TEXT NOT NULL,
  paymentStatus TEXT NOT NULL,
  paidAmount REAL DEFAULT 0,
  dueAmount REAL DEFAULT 0,

  orderStatus TEXT NOT NULL,

  source TEXT DEFAULT 'POS',
  deviceId TEXT NOT NULL,
  deviceName TEXT,
  appVersion TEXT,

  businessDate TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER,

  syncStatus TEXT NOT NULL,
  lastSyncedAt INTEGER,

  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_master_sync
  ON order_master(syncStatus);

CREATE INDEX IF NOT EXISTS idx_order_master_created
  ON order_master(createdAt);

CREATE INDEX IF NOT EXISTS idx_order_master_type
  ON order_master(orderType);



       CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      categoryName TEXT NOT NULL,
      productMode TEXT NOT NULL,
      currentStock REAL DEFAULT 0,

      orderMasterId TEXT NOT NULL,
      productId TEXT NOT NULL,

      createdById TEXT DEFAULT '',
      createdByName TEXT DEFAULT '',

      name TEXT NOT NULL,
      categoryId TEXT NOT NULL,

      parentId TEXT,
      isVariant INTEGER NOT NULL DEFAULT 0,

      basePrice REAL NOT NULL,
      quantity INTEGER NOT NULL,
      itemSubtotal REAL NOT NULL,

      currency TEXT,
      paymentStatus TEXT,

      taxRate REAL NOT NULL DEFAULT 0,
      taxType TEXT NOT NULL DEFAULT 'exclusive',

      taxAmountPerItem REAL NOT NULL DEFAULT 0,
      taxTotal REAL NOT NULL DEFAULT 0,

      note TEXT DEFAULT '',
      modifiersJson TEXT DEFAULT '',
      modifierPrice REAL DEFAULT 0,
      modifierSummary TEXT DEFAULT '',

      finalPricePerItem REAL NOT NULL,
      finalTotal REAL NOT NULL,

      source TEXT DEFAULT 'POS',
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order
      ON order_items(orderMasterId);

    CREATE INDEX IF NOT EXISTS idx_order_items_product
      ON order_items(productId);

    CREATE INDEX IF NOT EXISTS idx_order_items_created
      ON order_items(createdAt);
  




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
  
};