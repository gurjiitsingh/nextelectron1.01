export const posApi = {
  addCartItem: (item: any, tableNo: string) =>
    window.posApi.addCartItem(item, tableNo),

  getCartItems: (tableNo: string) =>
    window.posApi.getCartItems(tableNo),

  removeCartItem: (
    uniqueKey: string,
    tableNo: string,
    removeAll = false
  ) =>
    window.posApi.removeCartItem(
      uniqueKey,
      tableNo,
      removeAll
    ),

  clearCart: (tableNo: string) =>
    window.posApi.clearCart(tableNo),

  syncAll: () => window.posApi.syncAll(),
};