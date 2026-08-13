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

 
createBill: (input: {
  tableNo: string;
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

  customerName?: string;
  customerPhone?: string;
  customerId?: string | null;

  discountTotal?: number;
  deliveryFee?: number;
  deliveryTax?: number;

  paymentMode?: string;
  paymentStatus?: string;

  paidAmount?: number;

  payments?: Array<{
    mode: string;
    amount: number;
    provider?: string | null;
    method?: string | null;
  }>;

  ownerId?: string;
  outletId?: string;

  deviceId?: string;
  deviceName?: string;
  appVersion?: string;

  businessDate?: string;

  currency?: string;
}) => Promise<{
  success: boolean;
  error?: string;

  orderId?: string;
  srno?: string;

  tableNo?: string;
  itemCount?: number;

  itemTotal?: number;
  itemTax?: number;
  taxTotal?: number;
  discountTotal?: number;
  deliveryFee?: number;

  grandTotal?: number;
  paidAmount?: number;
  dueAmount?: number;

  paymentStatus?: string;
}>,

getBillableKotItems: (
  tableNo: string
) => Promise<any[]>,



      // Modifiers
      getModifierGroups: () => Promise<any[]>;

      getProductModifiers: () => Promise<any[]>;
    };
  }
}