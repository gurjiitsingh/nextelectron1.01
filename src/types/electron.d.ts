export {};

declare global {
  interface Window {
    posApi: {
      // Cart
      addCartItem: (
        item: any,
        tableNo: string
      ) => Promise<void>;

      getCartItems: (
        tableNo: string
      ) => Promise<any[]>;

      removeCartItem: (
        uniqueKey: string,
        tableNo: string,
        removeAll?: boolean
      ) => Promise<any>;

      clearCart: (
        tableNo: string
      ) => Promise<any>;

      // Sync
      syncAll: () => Promise<any>;

      // Categories
      getAllCategories: () => Promise<any[]>;

      // Products
      getAllProducts: () => Promise<any[]>;

      getProductsByCategory: (
        categoryId: string
      ) => Promise<any[]>;

      searchProducts: (
        query: string,
        foodType?: string | null
      ) => Promise<any[]>;

      searchExactCode: (
        code: string,
        foodType?: string | null
      ) => Promise<any[]>;



//KOT

insertKotItems: (
  items: any[]
) => Promise<{ success: boolean }>;

getPendingKotByTable: (
  tableNo: string
) => Promise<any[]>;

getKotByBatch: (
  kotBatchId: string
) => Promise<any[]>;

markKotPrinted: (
  kotBatchId: string
) => Promise<any>;

updateKotStatus: (
  id: string,
  status: string
) => Promise<any>;



      // Modifiers
      getModifierGroups: () => Promise<any[]>;

      getProductModifiers: () => Promise<any[]>;
    };
  }
}