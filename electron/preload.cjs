const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD EXECUTED');

contextBridge.exposeInMainWorld('posApi', {
// =====================================================
// CART
// =====================================================
addCartItem: (item, tableNo) =>
ipcRenderer.invoke('cart:add', item, tableNo),

getCartItems: (tableNo) =>
ipcRenderer.invoke('cart:list', tableNo),

removeCartItem: (
uniqueKey,
tableNo,
removeAll = false
) =>
ipcRenderer.invoke(
'cart:remove',
uniqueKey,
tableNo,
removeAll
),

debugCounts: () =>
  ipcRenderer.invoke('debug:counts'),

clearCart: (tableNo) =>
ipcRenderer.invoke('cart:clear', tableNo),

// =====================================================
// SYNC
// =====================================================
syncAll: () =>
ipcRenderer.invoke('sync:all'),

// =====================================================
// CATEGORIES
// =====================================================
getAllCategories: () =>
ipcRenderer.invoke('categories:list'),

// =====================================================
// PRODUCTS
// =====================================================
getAllProducts: () =>
ipcRenderer.invoke('products:list'),

getProductsByCategory: (categoryId) =>
ipcRenderer.invoke(
'products:by-category',
categoryId
),

searchProducts: (
query,
foodType = null
) =>
ipcRenderer.invoke(
'products:search',
query,
foodType
),

searchExactCode: (
code,
foodType = null
) =>
ipcRenderer.invoke(
'products:search-code',
code,
foodType
),

// =====================================================
// MODIFIERS
// =====================================================
getModifierGroups: () =>
  ipcRenderer.invoke(
    'modifier-groups:list'
  ),

getProductModifiers: () =>
  ipcRenderer.invoke(
    'product-modifiers:list'
  ),



  // =====================================================
// KOT
// =====================================================
insertKotItems: (items) =>
  ipcRenderer.invoke('kot:insert', items),

getPendingKotByTable: (tableNo) =>
  ipcRenderer.invoke(
    'kot:pending-by-table',
    tableNo
  ),

getKotByBatch: (kotBatchId) =>
  ipcRenderer.invoke(
    'kot:by-batch',
    kotBatchId
  ),

markKotPrinted: (kotBatchId) =>
  ipcRenderer.invoke(
    'kot:mark-printed',
    kotBatchId
  ),

updateKotStatus: (id, status) =>
  ipcRenderer.invoke(
    'kot:update-status',
    id,
    status
  ),


});
