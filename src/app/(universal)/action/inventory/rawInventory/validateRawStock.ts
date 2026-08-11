export function validateRawStock(updates: any[]) {
  for (const u of updates) {
console.log(u.inventoryItemName, u.storeStock,u.sendQty);
    
    if (u.prev < u.quantity) {
      throw new Error(
        `${u.inventoryItemName}: Available ${u.storeStock} ${u.transactionUnit}, Required ${u.sendQty} ${u.transactionUnit}`
      );
    }
  }
}