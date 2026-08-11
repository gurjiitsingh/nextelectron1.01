const { syncCategories } = require('./categorySync.cjs');
const { syncProducts } = require('./productSync.cjs');
const {
  syncModifierGroups,
  syncModifierItems,
  syncProductModifiers,
} = require('./modifierSync.cjs');

async function syncAll() {
  try {
    console.log('Syncing categories...');
    await syncCategories();

    console.log('Syncing products...');
    await syncProducts();

    console.log(
      'Syncing modifier groups...'
    );
    await syncModifierGroups();

    console.log(
      'Syncing modifier items...'
    );
    await syncModifierItems();

    console.log(
      'Syncing product modifiers...'
    );
    await syncProductModifiers();

    console.log('Sync complete');
    return { success: true };
  } catch (e) {
    console.error('Sync failed', e);
    return {
      success: false,
      error: e.message,
    };
  }
}

module.exports = { syncAll };