export function validateRawStockProduction(
  updates: any[]
) {
  for (const u of updates) {
    // console.log("========== STOCK VALIDATION ==========");
    // console.log("Item:", u.inventoryItemName);
    // console.log("Inventory Item ID:", u.inventoryItemId);

    // console.log(
    //   "Department Current Quantity:",
    //   u.currentQuantity
    // );

    // console.log(
    //   "Department New Quantity:",
    //   u.newQuantity
    // );

    // console.log(
    //   "Required Quantity:",
    //   u.quantityChange
    // );

    // console.log(
    //   "Purchase Unit:",
    //   u.purchaseUnit
    // );

    // console.log(
    //   "Consumption Unit:",
    //   u.consumptionUnit
    // );

    // console.log(
    //   "Comparison:",
    //   `${u.currentQuantity} < ${u.quantityChange} = ${
    //     u.currentQuantity < u.quantityChange
    //   }`
    // );

    // console.log("======================================");

    if (u.currentQuantity < u.quantityChange) {
      throw new Error(
        `${u.inventoryItemName}: Available ${u.currentQuantity} ${u.consumptionUnit}, Required ${u.quantityChange} ${u.consumptionUnit}`
      );
    }
  }
}