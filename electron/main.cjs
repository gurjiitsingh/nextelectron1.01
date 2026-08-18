const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
} = require('electron');

const { shell } = require('electron');
 
const fs = require('fs');
const path = require('path');

const { syncAll } = require('./sync/syncAll.cjs');
const billRepo = require('./db/billItemRepo.cjs');
// Import BOTH db and getDebugCounts from the same file
const { db, getDebugCounts } = require('./db/sqlite.cjs');
const tableRepo = require('./db/tableRepo.cjs');
console.log('MAIN STARTED');
 console.log(
  'USER DATA PATH:',
  app.getPath('userData')
);
const {
  getModifierGroups,
} = require('./db/modifierGroupRepo.cjs');

const cartRepo = require('./db/cartRepo.cjs');
 const orderRepo = require('./db/orderRepo.cjs');
const {
  getProductModifiers,
} = require('./db/productModifierRepo.cjs');

const dayClosingRepo =
  require('./db/dayClosingRepository.cjs');

const businessDayRepo =
  require('./db/businessDayRepository.cjs');

  const kotHistoryRepo =
  require('./db/kotHistoryRepository.cjs');

const billItemRepo = require('./db/billItemRepo.cjs');

const { getAllUsers } = require('./db/userRepo.cjs');
const { getOutlet } = require('./db/outletRepo.cjs');

const saleReportRepo = require(
  './db/saleReportRepo.cjs'
);

// =====================================================
// PRINTER
// =====================================================
const {
  printManager,
} = require('../shared/printer/PrintManager.cjs');

const {
  PrinterRole,
} = require('../shared/printer/types.js');

 
const {
  uploadOrderCounter,
} = require('./sync/orderCounterUpload.cjs');

const {
  PrinterSettingsRepository,
} = require('../shared/printer/PrinterSettingsRepository.cjs');

const printerSettingsRepo =
  new PrinterSettingsRepository();



// =====================================================
// UPLOAD DATA
// =====================================================
app.on('before-quit', async () => {
  try {
    await uploadOrderCounter();
  } catch (e) {
    console.error(
      'Failed to upload order counter on quit',
      e
    );
  }
});


ipcMain.handle(
  'orderCounter:upload',
  async () => {
    try {
      const result = await uploadOrderCounter();

      return {
        success: true,
        ...result,
      };
    } catch (e) {
      console.error('ORDER COUNTER UPLOAD FAILED', e);

      return {
        success: false,
        error: e?.message || String(e),
      };
    }
  }
);

// =====================================================
// PRINTER IPC
// =====================================================

ipcMain.handle(
  'printer:print',
  async (_event, payload) => {
    try {
      const { role, data, source } = payload;

      const jobId = await printManager.enqueue(
        role,
        data,
        source || 'POS'
      );

      return {
        success: true,
        jobId,
      };
    } catch (e) {
      console.error('PRINTER PRINT FAILED', e);

      return {
        success: false,
        error: e?.message || String(e),
      };
    }
  }
);

ipcMain.handle(
  'printer:queue-length',
  async () => {
    return printManager.getQueueLength();
  }
);

// =====================================================
// PRINTER SETTINGS
// =====================================================

ipcMain.handle(
  'printer-settings:get-all',
  async () => {
    return printerSettingsRepo.readAll();
  }
);

ipcMain.handle(
  'printer-settings:save',
  async (_event, config) => {
    printerSettingsRepo.saveConfig(config);

    return {
      success: true,
    };
  }
);


// =====================================================
// BILL IMAGE PREVIEW IPC
// =====================================================

ipcMain.handle(
  'printer:preview-bill-image',
  async (_event, data) => {
    try {
      console.log(
        '[PREVIEW] Generating bill image...'
      );

      // -------------------------------------------------
      // IMPORTANT:
      // Use the SAME formatter as actual IMAGE printing.
      // -------------------------------------------------

      const {
        BillImageFormatter80,
      } = require('../shared/printer/formatters/BillImageFormatter80.cjs');

      const formatter =
        new BillImageFormatter80();

      const pngBuffer =
        await formatter.format(data);

      // -------------------------------------------------
      // Save temporary preview PNG
      // -------------------------------------------------

      const previewDir =
        path.join(
          app.getPath('temp'),
          'pos-bill-previews'
        );

      if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(
          previewDir,
          { recursive: true }
        );
      }

      const filePath =
        path.join(
          previewDir,
          `bill-preview-${Date.now()}.png`
        );

      fs.writeFileSync(
        filePath,
        pngBuffer
      );

      console.log(
        '[PREVIEW] PNG CREATED:',
        filePath
      );

      return {
        success: true,
        filePath,
      };

    } catch (e) {

      console.error(
        '[PREVIEW] BILL IMAGE FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);

// =====================================================
// OPEN BILL IMAGE
// =====================================================

ipcMain.handle(
  'printer:open-file',
  async (_event, filePath) => {
    try {

      if (!filePath) {
        throw new Error(
          'Missing file path'
        );
      }

      const errorMessage =
        await shell.openPath(filePath);

      if (errorMessage) {
        throw new Error(
          errorMessage
        );
      }

      return {
        success: true,
      };

    } catch (e) {

      console.error(
        '[PREVIEW] OPEN FILE FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);

 // =====================================================
// SYNC DATA
// =====================================================

ipcMain.handle('users:list', async () => {
  return getAllUsers();
});

ipcMain.handle('outlet:get', async () => {
  return getOutlet();
});

 ipcMain.handle(
  'tables:list',
  async () => {
    return tableRepo.getAllTables();
  }
);

// =====================================================
// REPOSITORIES
// =====================================================


const {
  getAllCategories,
} = require('./db/categoryRepo.cjs');

const {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  searchExactCode,
} = require('./db/productRepo.cjs');

const kotRepo = require('./db/kotRepo.cjs');

const {
  createBillFromKitchen,
  getBillableKotItems,
} = require('./db/billingRepo.cjs');

// OPTIONAL: only if these repos exist




// =====================================================
// KOT IPC
// =====================================================

// ipcMain.handle(
//   'pos:kot:insertBatch',
//   async (_, batch) => {
//     return kotRepo.insertKotBatch(batch);
//   }
// )

// ipcMain.handle(
//   'kot:insert',
//   async (_e, items) => {
//     await kotRepo.insertKotItems(items);

//     return { success: true };
//   }
// );

ipcMain.handle(
  'kot:create',
  async (_e, { batch, items }) => {

    const result =
      await kotRepo.createKot({
        batch,
        items,
      });

    return result;
  }
);

// =====================================================
// KOT HISTORY 
// =====================================================



ipcMain.handle(
  'kot-history:create',
  async (_event, data) => {

    return kotHistoryRepo.createKotHistory(data);

  }
);

ipcMain.handle(
  'pos:getKotHistory',
  async (_event, args = {}) => {

    try {

      return {
        success: true,
        data: kotHistoryRepo.getKotHistory(args),
      };

    } catch (error) {

      console.error(
        'GET KOT HISTORY FAILED',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to load KOT history',
      };
    }
  }
);


ipcMain.handle(
  'pos:getKotHistoryDetail',
  async (_event, kotHistoryId) => {

    try {

      return {
        success: true,
        data:
          kotHistoryRepo.getKotHistoryDetail(
            kotHistoryId
          ),
      };

    } catch (error) {

      console.error(
        'GET KOT HISTORY DETAIL FAILED',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to load KOT history detail',
      };
    }
  }
);



ipcMain.handle(
  'pos:getRecentKotHistoryItems',
  async (_event, limit = 20) => {

    try {

      return {
        success: true,

        data:
          kotHistoryRepo.getRecentKotHistoryItems(
            limit
          ),
      };

    } catch (error) {

      console.error(
        'GET RECENT KOT HISTORY ITEMS FAILED',
        error
      );

      return {
        success: false,

        error:
          error?.message ||
          'Failed to load KOT history items',
      };
    }
  }
);


ipcMain.handle(
  'kotHistory:markTablePaid',
  async (_event, args) => {

    try {

      console.log(
        'IPC kotHistory:markTablePaid',
        args
      );


      const result =
        kotHistoryRepo.markTableHistoryPaid(
          args
        );


      console.log(
        'IPC kotHistory:markTablePaid RESULT:',
        result
      );


      return result;

    } catch (error) {

      console.error(
        'IPC KOT HISTORY PAID FAILED:',
        error
      );


      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }
);

// =====================================================
// MARK KOT HISTORY PAID
// =====================================================

ipcMain.handle(
  'kot-history:mark-paid',
  async (_e, kotHistoryId) => {
console.log("call------------------------")
    try {

      if (!kotHistoryId) {
        throw new Error(
          'KOT history ID is required'
        );
      }

      const result =
        kotHistoryRepo.markKotHistoryPaid(
          kotHistoryId
        );

      return result;

    } catch (error) {

      console.error(
        'MARK KOT HISTORY PAID FAILED:',
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }
);

ipcMain.handle(
  'pos:kot:generateNumber',
  async () => {
    return kotRepo.generateNextKotNumber();
  }
);

ipcMain.handle(
  'kot:pending-by-table',
  async (_e, tableNo) => {
    return kotRepo.getPendingKotByTable(
      tableNo
    );
  }
);

ipcMain.handle(
  'kot:by-batch',
  async (_e, kotBatchId) => {
    return kotRepo.getKotByBatch(
      kotBatchId
    );
  }
);

ipcMain.handle(
  'kot:mark-printed',
  async (_e, kotBatchId) => {
    return kotRepo.markKotPrinted(
      kotBatchId
    );
  }
);

ipcMain.handle(
  'kot:update-status',
  async (_e, id, status) => {
    return kotRepo.updateKotStatus(
      id,
      status
    );
  }
);

// =====================================================
// KOT HISTORY
// =====================================================

ipcMain.handle(
  'kot-history:list',
  async (_event, options = {}) => {

    try {

      return {
        success: true,

        data:
          kotHistoryRepo.getKotHistory(
            options
          ),
      };

    } catch (error) {

      console.error(
        'GET KOT HISTORY FAILED:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          String(error),
      };
    }
  }
);



ipcMain.handle(
  'kot-history:detail',
  async (_event, kotHistoryId) => {

    try {

      return {
        success: true,

        data:
          kotHistoryRepo.getKotHistoryDetail(
            kotHistoryId
          ),
      };

    } catch (error) {

      console.error(
        'GET KOT HISTORY DETAIL FAILED:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          String(error),
      };
    }
  }
);


// =====================================================
// BILLING
// =====================================================



ipcMain.handle(
  'bill-items:insert',
  async (_e, items) => {
    billItemRepo.insertBillItems(items);
    return { success: true };
  }
);

ipcMain.handle(
  'bill-items:list',
  async (_e, tableNo) => {
    return billItemRepo.getOpenBillItems(tableNo);
  }
);

ipcMain.handle(
  'bill-items:mark-billed',
  async (_e, tableNo, billId, billNo) => {
    return billItemRepo.markBillItemsBilled(
      tableNo,
      billId,
      billNo
    );
  }
);

ipcMain.handle(
  'bill:create',
  async (_event, input) => {
    try {
      const result =
        await createBillFromKitchen(
          input
        );

      return result;
    } catch (error) {
      console.error(
        'BILL CREATE FAILED:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to create bill',
      };
    }
  }
);

ipcMain.handle(
  'clear-kot-by-table',
  async (_event, tableNo) => {
    await db
      .prepare(
        'DELETE FROM pos_kot_items WHERE tableNo = ?'
      )
      .run(tableNo);

    return { success: true };
  }
);

ipcMain.handle(
  'bill:get-kot-items',
  async (_event, tableNo) => {
    try {
      return getBillableKotItems(
        tableNo
      );
    } catch (error) {
      console.error(
        'GET BILL ITEMS FAILED:',
        error
      );

      throw error;
    }
  }
);


 // =====================================================
 // ORDERS
 // =====================================================

 ipcMain.handle(
   'orders:list',
   async (_e, date) => {
     return orderRepo.getOrders(date);
   }
 );

 ipcMain.handle(
   'orders:get',
   async (_e, orderId) => {
     return orderRepo.getOrderById(orderId);
   }
 );

 ipcMain.handle(
   'orders:items',
   async (_e, orderId) => {
     return orderRepo.getOrderItems(orderId);
   }
 );
// =====================================================
// WINDOW
// =====================================================

function createWindow() {
  const preloadPath = path.resolve(
    __dirname,
    'preload.cjs'
  );

  console.log(
    'PRELOAD =>',
    preloadPath
  );

  const isDev =
    process.env.NODE_ENV ===
    'development';

  const win = new BrowserWindow({
    width: 1400,
    height: 900,

    // Show after maximize
    show: false,

    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Open maximized
  win.maximize();

  // Show after maximize
  win.once('ready-to-show', () => {
    win.show();
  });

  // DevTools only in development
  if (isDev) {
    win.webContents.openDevTools();
  }

  win.loadURL('http://localhost:3000');

  return win;
}

// =====================================================
// APP READY
// =====================================================

app.whenReady().then(() => {
  // -------------------------------
  // DEBUG
  // -------------------------------

  ipcMain.handle(
    'debug:counts',
    async () => {
      return getDebugCounts();
    }
  );

  // -------------------------------
  // CART
  // -------------------------------

  ipcMain.handle(
    'cart:list',
    async (_e, tableNo) => {
      // console.log(
      //   'IPC cart:list',
      //   tableNo
      // );

      return cartRepo.getCartItems(
        tableNo
      );
    }
  );

  ipcMain.handle(
    'cart:add',
    async (_e, item, tableNo) => {
      // console.log(
      //   'IPC cart:add',
      //   item
      // );

      return cartRepo.addCartItem(
        item,
        tableNo
      );
    }
  );

  ipcMain.handle(
    'cart:remove',
    async (
      _e,
      uniqueKey,
      tableNo,
      removeAll
    ) => {
      return cartRepo.removeCartItem(
        uniqueKey,
        tableNo,
        removeAll
      );
    }
  );

  ipcMain.handle(
    'cart:clear',
    async (_e, tableNo) => {
      return cartRepo.clearCart(
        tableNo
      );
    }
  );
  // -------------------------------
  // ADD REMOVE ITEM FROM BILL
  // -------------------------------

ipcMain.handle(
  'bill:update-item-quantity',
  async (_event, args) => {

    try {

      return await billRepo.updateBillItemQuantity(
        args
      );

    } catch (error) {

      console.error(
        'BILL UPDATE ITEM QUANTITY FAILED:',
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }
);


ipcMain.handle(
  'bill:delete-item',
  async (_event, args) => {

    try {

      return await billRepo.deleteBillItem(
        args
      );

    } catch (error) {

      console.error(
        'BILL DELETE ITEM FAILED:',
        error
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }
);

  // -------------------------------
  // SYNC
  // -------------------------------

  ipcMain.handle(
    'sync:all',
    async () => {
      return syncAll();
    }
  );

  // -------------------------------
  // CATEGORIES
  // -------------------------------

  ipcMain.handle(
    'categories:list',
    async () => getAllCategories()
  );

  // -------------------------------
  // PRODUCTS
  // -------------------------------

  ipcMain.handle(
    'products:list',
    async () => getAllProducts()
  );

  ipcMain.handle(
    'products:by-category',
    async (_e, categoryId) =>
      getProductsByCategory(categoryId)
  );

  ipcMain.handle(
    'products:search',
    async (_e, query, foodType) =>
      searchProducts(
        query,
        foodType
      )
  );

  ipcMain.handle(
    'products:search-code',
    async (_e, code, foodType) =>
      searchExactCode(
        code,
        foodType
      )
  );

  // -------------------------------
  // MODIFIERS
  // -------------------------------

ipcMain.handle(
  'modifier-groups:list',
  async () => getModifierGroups()
);
  

  ipcMain.handle(
    'product-modifiers:list',
    async () => getProductModifiers()
  );

  // -------------------------------
  // CREATE WINDOW
  // -------------------------------



  const win = createWindow();


    // Upload local counter every 5 minutes
  setInterval(() => {
    uploadOrderCounter().catch(console.error);
  }, 5 * 60 * 1000);

  // F12 = Toggle DevTools
  globalShortcut.register(
    'F12',
    () => {
      win.webContents.toggleDevTools();
    }
  );

  // Ctrl+Shift+I = Toggle DevTools
  globalShortcut.register(
    'CommandOrControl+Shift+I',
    () => {
      win.webContents.toggleDevTools();
    }
  );
});




// =====================================================
// BUSINESS DAY
// =====================================================

ipcMain.handle(
  'businessDay:getCurrent',
  async () => {

    try {

      return {
        success: true,
        data:
          businessDayRepo
            .getCurrentBusinessDay(),
      };

    } catch (e) {

      console.error(
        'GET CURRENT BUSINESS DAY FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);


// =====================================================
// DAY CLOSING SUMMARY
// =====================================================

ipcMain.handle(
  'dayClosing:getSummary',
  async (
    _event,
    businessDate
  ) => {

    try {

      const summary =
        dayClosingRepo
          .getSummary(
            businessDate
          );

      return {
        success: true,
        data: summary,
      };

    } catch (e) {

      console.error(
        'GET DAY CLOSING SUMMARY FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);


// =====================================================
// DAY CLOSING HISTORY
// =====================================================

ipcMain.handle(
  'dayClosing:getHistory',
  async () => {

    try {

      const history =
        dayClosingRepo
          .getHistory();

      return {
        success: true,
        data: history,
      };

    } catch (e) {

      console.error(
        'GET DAY CLOSING HISTORY FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);


// =====================================================
// CLOSE BUSINESS DAY
// =====================================================

ipcMain.handle(
  'dayClosing:close',
  async (
    _event,
    data
  ) => {

    try {

      console.log(
        '===================================='
      );

      console.log(
        'DAY CLOSING REQUEST'
      );

      console.log(
        'DATA:',
        data
      );

      console.log(
        '===================================='
      );


      const result =
        dayClosingRepo
          .closeBusinessDay({
            actualCash:
              Number(
                data?.actualCash || 0
              ),

            notes:
              data?.notes || '',

            closedById:
              data?.closedById || '',

            closedByName:
              data?.closedByName || '',
          });


      console.log(
        'DAY CLOSED SUCCESSFULLY:',
        result
      );


      return {
        success: true,
        data: result,
      };

    } catch (e) {

      console.error(
        'DAY CLOSING FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);





// =====================================================
// SALE REPORT
// =====================================================
ipcMain.handle(
  'saleReport:getReport',
  async (_event, businessDate) => {

    try {

      if (!businessDate) {
        return {
          success: false,
          error: 'Business date is required',
        };
      }

      const report =
        saleReportRepo.getSalesReport(
          businessDate
        );

      return {
        success: true,
        data: report,
      };

    } catch (e) {

      console.error(
        'GET SALES REPORT FAILED',
        e
      );

      return {
        success: false,
        error:
          e?.message ||
          String(e),
      };
    }
  }
);
// =====================================================
// CLEANUP
// =====================================================

app.on(
  'window-all-closed',
  () => {
    if (
      process.platform !== 'darwin'
    ) {
      app.quit();
    }
  }
);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});