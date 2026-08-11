const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
  const { syncAll } = require('./sync/syncAll.cjs');
console.log('MAIN STARTED');

const { getDebugCounts } = require('./db/sqlite.cjs');

// SQLite repository


// const cartRepo = require(path.resolve(
//   __dirname,
//   '..',
//   'src',
//   'lib',
//   'pos',
//   'repositories',
//   'cartRepo.ts'
// ));
const cartRepo = require('./db/cartRepo.cjs');
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


ipcMain.handle(
  'kot:insert',
  async (_e, items) => {
    await kotRepo.insertKotItems(items);
    return { success: true };
  }
);

ipcMain.handle(
  'kot:pending-by-table',
  async (_e, tableNo) => {
    return kotRepo.getPendingKotByTable(tableNo);
  }
);

ipcMain.handle(
  'kot:by-batch',
  async (_e, kotBatchId) => {
    return kotRepo.getKotByBatch(kotBatchId);
  }
);

ipcMain.handle(
  'kot:mark-printed',
  async (_e, kotBatchId) => {
    return kotRepo.markKotPrinted(kotBatchId);
  }
);

ipcMain.handle(
  'kot:update-status',
  async (_e, id, status) => {
    return kotRepo.updateKotStatus(id, status);
  }
);

function createWindow() {
  const preloadPath = path.resolve(
    __dirname,
    'preload.cjs'
  );

  console.log('PRELOAD =>', preloadPath);

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.webContents.openDevTools();

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // ===============================
  // IPC HANDLERS
  // ===============================
ipcMain.handle('debug:counts', async () => {
  return getDebugCounts();
});
  ipcMain.handle(
    'cart:list',
    async (_e, tableNo) => {
      console.log('IPC cart:list', tableNo);

      return cartRepo.getCartItems(
        tableNo
      );
    }
  );

  ipcMain.handle(
    'cart:add',
    async (_e, item, tableNo) => {
      console.log('IPC cart:add', item);

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
      return cartRepo.clearCart(tableNo);
    }
  );



ipcMain.handle('sync:all', async () => {
  return syncAll();
});




ipcMain.handle(
  'categories:list',
  async () => getAllCategories()
);

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
    searchProducts(query, foodType)
);

ipcMain.handle(
  'products:search-code',
  async (_e, code, foodType) =>
    searchExactCode(code, foodType)
);



ipcMain.handle(
  'modifier-groups:list',
  async () => getModifierGroups()
);

ipcMain.handle(
  'product-modifiers:list',
  async () => getProductModifiers()
);








  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});