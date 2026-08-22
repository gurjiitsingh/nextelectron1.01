const { initDb } = require('./db/initDb.cjs');


const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
} = require('electron');

const { shell } = require('electron');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
  createWaiterLanServer,
  stopWaiterLanServer,
} = require('./waiterLanServer.cjs');

const userRepository = require("./db/userRepo.cjs");
const authRepository = require("./db/authRepository.cjs");
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
} = require('../shared/printer/types.ts');


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

      const {
        role,
        data,
        source,
      } = payload;


      // ===============================================
      // PRINT
      // ===============================================

      const jobId =
        await printManager.enqueue(
          role,
          data,
          source || 'POS'
        );


      // ===============================================
      // UPDATE TABLE STATUS
      // ONLY FOR BILL PRINT
      // ===============================================

      if (
        role === 'BILL' &&
        data?.tableNo
      ) {

        tableRepo.updateTableStatus(
          data.tableNo,
          'PAYMENT_PENDING'
        );

      }


      return {
        success: true,
        jobId,
      };

    } catch (e) {

      console.error(
        'PRINTER PRINT FAILED',
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


// =====================================================
// INSERT BILL ITEMS
// =====================================================

ipcMain.handle(
  'bill-items:insert',
  async (_e, items) => {

    try {

      const result =
        await billItemRepo.insertBillItems(
          items
        );

      // ===========================================
      // BILL ITEMS HAVE CHANGED
      // ===========================================

      tableRepo.refreshAllTableBillVisualStates();

      return {
        success: true,
        result,
      };

    } catch (error) {

      console.error(
        'BILL ITEMS INSERT FAILED:',
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
// CREATE BILL
// =====================================================

ipcMain.handle(
  'bill:create',
  async (_event, input) => {

    try {

      const result =
        await createBillFromKitchen(
          input
        );

      // ===========================================
      // BILL CREATED SUCCESSFULLY
      // ===========================================

      if (result?.success !== false) {

        // Cart was changed/cleared
        tableRepo.refreshAllTableCartVisualStates();

        // Bill state was changed
        tableRepo.refreshAllTableBillVisualStates();

      }

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


// =====================================================
// UPDATE BILL ITEM QUANTITY
// =====================================================

ipcMain.handle(
  'bill:update-item-quantity',
  async (_event, args) => {

    try {

      const result =
        await billRepo.updateBillItemQuantity(
          args
        );

      // ===========================================
      // BILL ITEM CHANGED
      // ===========================================

      if (result?.success !== false) {

        tableRepo.refreshAllTableBillVisualStates();

      }

      return result;

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


// =====================================================
// DELETE BILL ITEM
// =====================================================

ipcMain.handle(
  'bill:delete-item',
  async (_event, args) => {

    try {

      const result =
        await billRepo.deleteBillItem(
          args
        );

      // ===========================================
      // BILL ITEM CHANGED
      // ===========================================

      if (result?.success !== false) {

        tableRepo.refreshAllTableBillVisualStates();

      }

      return result;

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


// =====================================================
// LIST OPEN BILL ITEMS
// =====================================================

ipcMain.handle(
  'bill-items:list',
  async (_e, tableNo) => {

    return billItemRepo.getOpenBillItems(
      tableNo
    );

  }
);


// =====================================================
// MARK BILL ITEMS AS BILLED
// =====================================================

ipcMain.handle(
  'bill-items:mark-billed',
  async (
    _e,
    tableNo,
    billId,
    billNo
  ) => {

    const result =
      await billItemRepo.markBillItemsBilled(
        tableNo,
        billId,
        billNo
      );

    // ===========================================
    // IMPORTANT
    // Items are no longer OPEN
    // ===========================================

    if (result?.success !== false) {

      tableRepo.refreshAllTableBillVisualStates();

    }

    return result;

  }
);

// -------------------------------
// KOT 
// -------------------------------

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
  'orders:bussiness',
  async (_e, date) => {
    return orderRepo.getOrdersByBusinessDate(date);
  }
);

ipcMain.handle(
  'orders:realDate',
  async (_e, date) => {
    return orderRepo.getOrdersByRealDate(date);
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
// NEXT.JS PRODUCTION SERVER
// =====================================================

let nextServer = null;

 

// function startNextServer() {
//   if (!app.isPackaged) {
//     console.log(
//       'Development mode: Next.js runs on localhost:3000'
//     );
//     return;
//   }

//   const standalonePath = path.join(
//     __dirname,
//     '..',
//     '.next',
//     'standalone'
//   );

//   const serverPath = path.join(
//     standalonePath,
//     'server.js'
//   );

//   console.log(
//     'NEXT SERVER:',
//     serverPath
//   );

//   if (!fs.existsSync(serverPath)) {
//     throw new Error(
//       `Next.js server not found: ${serverPath}`
//     );
//   }

//   const nodePath =
//     process.platform === 'win32'
//       ? path.join(
//           process.resourcesPath,
//           'app.asar.unpacked',
//           'node_modules',
//           'electron',
//           'dist',
//           'electron.exe'
//         )
//       : process.execPath;

//   console.log(
//     'STARTING NEXT SERVER'
//   );

//   nextServer = spawn(
//     nodePath,
//     [serverPath],
//     {
//       cwd: standalonePath,

//       env: {
//         ...process.env,
//         NODE_ENV: 'production',
//         PORT: '3000',
//         HOSTNAME: '127.0.0.1',
//       },

//       stdio: 'inherit',
//       windowsHide: true,
//     }
//   );
// }

function startNextServer() {
  if (!app.isPackaged) {
    console.log(
      'Development mode: Next.js runs on localhost:3000'
    );
    return;
  }

  // =================================================
  // Next standalone is unpacked from app.asar
  // =================================================

  const standalonePath = path.join(
    process.resourcesPath,
    'app.asar.unpacked',
    '.next',
    'standalone'
  );

  

  const serverPath = path.join(
    standalonePath,
    'server.js'
  );

  console.log(
    'NEXT SERVER:',
    serverPath
  );

  console.log(
    'NEXT SERVER EXISTS:',
    fs.existsSync(serverPath)
  );

  if (!fs.existsSync(serverPath)) {
    throw new Error(
      `Next.js server not found: ${serverPath}`
    );
  }

  // =================================================
  // Use the current Electron executable as Node
  // =================================================

  const nodePath = process.execPath;

  console.log(
    'NEXT NODE PATH:',
    nodePath
  );

  console.log(
    'NEXT NODE EXISTS:',
    fs.existsSync(nodePath)
  );

  console.log(
    'NEXT WORKING DIRECTORY:',
    standalonePath
  );

  console.log(
    'NEXT WORKING DIRECTORY EXISTS:',
    fs.existsSync(standalonePath)
  );

  console.log(
    'STARTING NEXT SERVER'
  );

  nextServer = spawn(
    nodePath,
    [serverPath],
    {
      cwd: standalonePath,

      env: {
        ...process.env,

        ELECTRON_RUN_AS_NODE: '1',

        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '127.0.0.1',
      },

      stdio: 'inherit',
      windowsHide: true,
    }
  );

  nextServer.on('error', (error) => {
    console.error(
      'NEXT SERVER SPAWN FAILED:',
      error
    );
  });

  nextServer.on('exit', (code, signal) => {
    console.log(
      'NEXT SERVER EXITED:',
      {
        code,
        signal,
      }
    );

    nextServer = null;
  });
}


function stopNextServer() {
  if (!nextServer) {
    return;
  }

  console.log(
    'Stopping Next.js production server...'
  );

  try {
    nextServer.kill();
  } catch (error) {
    console.error(
      'Failed to stop Next.js server:',
      error
    );
  }

  nextServer = null;
}
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

  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1400,
    height: 900,

    show: false,

    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.maximize();

  win.once('ready-to-show', () => {
    win.show();
  });

  if (isDev) {
    win.webContents.openDevTools();
  }

  if (isDev) {
    // Development
    win.loadURL(
      'http://localhost:3000'
    );
  } else {
    // Production
    win.loadURL(
      'http://127.0.0.1:3000'
    );
  }

  return win;
}

// =====================================================
// APP READY
// =====================================================

app.whenReady().then(async () => {


  // ===================================================
  // INITIALIZE DATABASE FIRST
  // ===================================================

  try {
    initDb();

    console.log('DATABASE INITIALIZED');

    console.log(
      'DATABASE COUNTS:',
      getDebugCounts()
    );

  } catch (error) {
    console.error(
      'DATABASE INITIALIZATION FAILED:',
      error
    );

    app.quit();
    return;
  }

  // ===================================================
  // START NEXT.JS IN PRODUCTION
  // ===================================================

  if (app.isPackaged) {
    startNextServer();

    // Give Next.js a moment to start
    await new Promise(
      resolve => setTimeout(resolve, 1500)
    );
  }



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

  // ===================================================
  // CREATE WINDOW
  // ===================================================

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
// GENERATE POS ORDER NUMBER
// TAKEAWAY -> TW1, TW2...
// DELIVERY -> DL1, DL2...
// =====================================================

ipcMain.handle(
  'pos-order:generate-number',
  async (_e, orderType) => {

    try {

      const orderNumber =
        orderRepo.generateNextPosOrderNumber(
          orderType
        );

      return orderNumber;

    } catch (error) {

      console.error(
        'pos-order:generate-number failed',
        error
      );

      throw error;
    }
  }
);


// =====================================================
// GET TODAY'S POS ORDER NUMBERS
//
// TAKEAWAY:
//   TW1, TW2, TW3...
//
// DELIVERY:
//   DL1, DL2, DL3...
// =====================================================

ipcMain.handle(
  'pos-order:list',
  async (_e, orderType) => {

    try {

      return await orderRepo.getTodayPosOrderNumbers(
        orderType
      );

    } catch (error) {

      console.error(
        'pos-order:list failed',
        error
      );

      throw error;
    }
  }
);

// =====================================================
// USER 
// =====================================================
ipcMain.handle("users:getAll", async () => {
  try {
    return userRepository.getAllUsers();
  } catch (error) {
    console.error("Failed to get users:", error);

    return [];
  }
});

// =====================================================
// POS LOGIN USERS
// =====================================================

ipcMain.handle("users:getPosLoginUsers", async () => {
  try {
    const users = userRepository.getPosLoginUsers();

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error(
      "Failed to get POS login users:",
      error
    );

    return {
      success: false,
      users: [],
      error:
        error.message ||
        "Failed to load POS users.",
    };
  }
});

// =====================================================
// POS USER LOGIN
// =====================================================

ipcMain.handle(
  "users:login",
  async (_event, { userId, pin }) => {
    try {
      return authRepository.loginUser(
        userId,
        pin
      );
    } catch (error) {
      console.error(
        "POS user login failed:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Login failed.",
      };
    }
  }
);

// =============================================
  // WAITER LAN SERVER
  // =============================================

  createWaiterLanServer();

  app.on('before-quit', () => {
  stopWaiterLanServer();
});


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

app.on('before-quit', () => {
  stopNextServer();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});