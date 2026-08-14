export const posApi = {
  addCartItem: (
    item: any,
    tableNo: string
  ) => window.posApi.addCartItem(item, tableNo),

  getCartItems: (
    tableNo?: string
  ) =>
    window.posApi.getCartItems(
      tableNo ?? 'T1'
    ),

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

  clearCart: (
    tableNo?: string
  ) =>
    window.posApi.clearCart(
      tableNo ?? 'T1'
    ),

  syncAll: () => window.posApi.syncAll(),
};