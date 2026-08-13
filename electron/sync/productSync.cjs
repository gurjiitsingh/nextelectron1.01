const {
  collection,
  getDocs,
} = require('firebase/firestore');

const { firestore } = require('./firebaseClient.cjs');

const {
  clearProducts,
  insertProducts,
  getAllProducts,
} = require('../db/productRepo.cjs');

function anyToDouble(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

async function syncProducts() {
  console.log('==============================');
  console.log('SYNC_PRODUCTS START');
  console.log('==============================');

  const snapshot = await getDocs(
    collection(firestore, 'products')
  );

  console.log(
    'FIRESTORE RAW DOCS =>',
    snapshot.size
  );

  const list = snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      id: doc.id,
      searchCode:
        data.searchCode ||
        doc.id.slice(-6),

      name: data.name || '',
      price: anyToDouble(data.price),
      discountPrice:
        typeof data.discountPrice ===
        'number'
          ? data.discountPrice
          : null,
      image: data.image || null,

      foodType: data.foodType || null,

      sortOrder: data.sortOrder || 0,
      kitchenPrintReq:
        data.kitchenPrintReq ?? null,

      categoryId: data.categoryId || '',
      productCat: data.productCat || '',

      parentId: data.parentId || null,
      baseProductId:
        data.baseProductId || null,

      hasVariants:
        data.hasVariants || false,
      hasModifiers:
        data.hasModifiers || false,

      currentStock:
        typeof data.currentStock ===
        'number'
          ? data.currentStock
          : 0,

      productMode:
        data.productMode || 'raw_stock',

      taxRate:
        typeof data.taxRate === 'number'
          ? data.taxRate
          : null,
      taxType: data.taxType || null,

      type: data.type || null,

      outletId: data.outletId || null,
    };
  });

  console.log(
    'FIRESTORE PRODUCTS FETCHED =>',
    list.length
  );

  if (list.length > 0) {
    console.log(
      'FIRST PRODUCT =>',
      list[0]
    );
  }

  console.log('CLEARING SQLITE PRODUCTS...');
  await clearProducts();

  console.log(
    'INSERTING SQLITE PRODUCTS...'
  );
  await insertProducts(list);

  const rows = await getAllProducts();

  console.log(
    'SQLITE PRODUCTS AFTER INSERT =>',
    rows.length
  );

  console.log('SYNC_PRODUCTS COMPLETE');
  console.log('==============================');
}

module.exports = { syncProducts };

