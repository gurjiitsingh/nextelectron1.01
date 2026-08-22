const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD EXECUTED');



console.log('PRELOAD EXECUTED');

contextBridge.exposeInMainWorld('posApi', {

  // =====================================================
  // SYNC DATA
  // =====================================================

  // getAllUsers: () =>
  //   ipcRenderer.invoke('users:list'),

  getOutlet: () =>
    ipcRenderer.invoke('outlet:get'),

  // =====================================================
  // TABLES
  // =====================================================

  getTables: () =>
    ipcRenderer.invoke('tables:list'),

  // =====================================================
  // CART
  // =====================================================

  addCartItem: (item, tableNo) =>
    ipcRenderer.invoke('cart:add', item, tableNo),

  getCartItems: (tableNo) =>
    ipcRenderer.invoke('cart:list', tableNo),

  updateCartItemNote: (
  itemId,
  note,
  tableNo
) =>
  ipcRenderer.invoke(
    'cart:update-note',
    itemId,
    note,
    tableNo
  ),


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
generateNextKotNumber: () =>
  ipcRenderer.invoke(
    'pos:kot:generateNumber'
  ),

  // insertKotBatch: (batch) =>
  // ipcRenderer.invoke(
  //   'pos:kot:insertBatch',
  //   batch
  // ),

    // insertKotItems: (items) =>
    // ipcRenderer.invoke(
    //   'kot:insert',
    //   items
    // ),

markKotHistoryPaid: (kotHistoryId) =>
  ipcRenderer.invoke(
    'kot-history:mark-paid',
    kotHistoryId
  ),    

createKot: (batch, items) =>
  ipcRenderer.invoke(
    'kot:create', 
    {
      batch,
      items,
    }
  ),

  createKotHistory: (data) =>
  ipcRenderer.invoke(
    'kot-history:create',
    data
  ),
  

getRecentKotHistoryItems: (
  limit = 20
) =>
  ipcRenderer.invoke(
    'pos:getRecentKotHistoryItems',
    limit
  ),

  getKotHistory: (
  args = {}
) =>
  ipcRenderer.invoke(
    'pos:getKotHistory',
    args
  ),

getKotHistoryDetail: (
  kotHistoryId
) =>
  ipcRenderer.invoke(
    'pos:getKotHistoryDetail',
    kotHistoryId
  ),



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



    getKotHistory: (options) =>
  ipcRenderer.invoke(
    'kot-history:list',
    options
  ),

getKotHistoryDetail: (kotHistoryId) =>
  ipcRenderer.invoke(
    'kot-history:detail',
    kotHistoryId
  ),

  markTableHistoryPaid: (args) =>
  ipcRenderer.invoke(
    'kotHistory:markTablePaid',
    args
  ),

   // =====================================================
  // UPDATE UI WHEN KOT RECIEVE FROM WAITER
  // =====================================================

onKotReceived: (callback) => {

  console.log(
    'REGISTERING WAITER KOT IPC LISTENER'
  );

  const listener = (_event, data) => {

  
    callback(data);
  };

  ipcRenderer.on(
    'waiter-kot-received',
    listener
  );

  return () => {

   
    ipcRenderer.removeListener(
      'waiter-kot-received',
      listener
    );
  };
},

  // =====================================================
  // BILLING
  // =====================================================

  insertBillItems: (items) =>
    ipcRenderer.invoke(
      'bill-items:insert',
      items
    ),

  getBillItems: (tableNo) =>
    ipcRenderer.invoke(
      'bill-items:list',
      tableNo
    ),

  markBillItemsBilled: (
    tableNo,
    billId,
    billNo
  ) =>
    ipcRenderer.invoke(
      'bill-items:mark-billed',
      tableNo,
      billId,
      billNo
    ),

  getBillableKotItems: (tableNo) =>
    ipcRenderer.invoke(
      'bill:get-kot-items',
      tableNo
    ),

  createBill: (input) =>
    ipcRenderer.invoke(
      'bill:create',
      input
    ),

  clearKotByTable: (tableNo) =>
    ipcRenderer.invoke(
      'clear-kot-by-table',
      tableNo
    ),



    updateBillItemQuantity: (args) =>
  ipcRenderer.invoke(
    'bill:update-item-quantity',
    args
  ),

deleteBillItem: (args) =>
  ipcRenderer.invoke(
    'bill:delete-item',
    args
  ),

  // =====================================================
// ORDERS
// =====================================================

getOrders: (date) =>
  ipcRenderer.invoke(
    'orders:list',
    date
  ),

  getOrdersByBusinessDate: (date) =>
  ipcRenderer.invoke(
    'orders:bussiness',
    date
  ),

  getOrdersByRealDate: (date) =>
  ipcRenderer.invoke(
    'orders:realDate',
    date
  ),

getOrderById: (orderId) =>
  ipcRenderer.invoke(
    'orders:get',
    orderId
  ),

getOrderItems: (orderId) =>
  ipcRenderer.invoke(
    'orders:items',
    orderId
  ),

  // =====================================================
  // ORDER COUNTER
  // =====================================================

  uploadOrderCounter: () =>
    ipcRenderer.invoke(
      'orderCounter:upload'
    ),

    // =====================================================
  // PRINTER
  // =====================================================

  print: (payload) =>
    ipcRenderer.invoke(
      'printer:print',
      payload
    ),

  getPrintQueueLength: () =>
    ipcRenderer.invoke(
      'printer:queue-length'
    ),

  // =====================================================
  // BILL IMAGE PREVIEW
  // =====================================================

  previewBillImage: (data) =>
    ipcRenderer.invoke(
      'printer:preview-bill-image',
      data
    ),

  openFile: (filePath) =>
    ipcRenderer.invoke(
      'printer:open-file',
      filePath
    ),

  // =====================================================
  // PRINTER SETTINGS
  // =====================================================

  getPrinterSettings: () =>
    ipcRenderer.invoke(
      'printer-settings:get-all'
    ),

  savePrinterSetting: (config) =>
    ipcRenderer.invoke(
      'printer-settings:save',
      config
    ),


      // =====================================================
  // BUSINESS DAY
  // =====================================================

  getCurrentBusinessDay: () =>
    ipcRenderer.invoke(
      'businessDay:getCurrent'
    ),


  // =====================================================
  // DAY CLOSING
  // =====================================================

  getDayClosingSummary: (
    businessDate
  ) =>
    ipcRenderer.invoke(
      'dayClosing:getSummary',
      businessDate
    ),


  getDayClosingHistory: () =>
    ipcRenderer.invoke(
      'dayClosing:getHistory'
    ),


  closeBusinessDay: (
    data
  ) =>
    ipcRenderer.invoke(
      'dayClosing:close',
      data
    ),




    // =====================================================
  // GET ALL USERS
  // =====================================================

  getAllUsers: () =>
    ipcRenderer.invoke(
      "users:getAll"
    ),


  // =====================================================
  // POS LOGIN USERS
  // =====================================================

  getPosLoginUsers: () =>
    ipcRenderer.invoke(
      "users:getPosLoginUsers"
    ),


  // =====================================================
  // POS USER LOGIN
  // =====================================================

  loginUser: ({
    userId,
    pin,
  }) =>
    ipcRenderer.invoke(
      "users:login",
      {
        userId,
        pin,
      }
    ),
  // =====================================================
  // SALE REPORTS
  // =====================================================


    getSalesReport: (
  businessDate
) =>
  ipcRenderer.invoke(
    'saleReport:getReport',
    businessDate
  ),

generateNextPosOrderNumber: (
  orderType
) =>
  ipcRenderer.invoke(
    'pos-order:generate-number',
    orderType
  ),




  
  // =====================================================
// POS ORDER LIST
// =====================================================

getTodayPosOrders: (orderType) =>
  ipcRenderer.invoke(
    'pos-order:list',
    orderType
  ),



firebase: {
  initialize: (clientId) =>
    ipcRenderer.invoke(
      "firebase:initialize",
      clientId
    ),

  getConfig: () =>
    ipcRenderer.invoke(
      "firebase:get-config"
    ),
},




});
