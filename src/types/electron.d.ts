export { };

declare global {
  interface Window {
    posApi: {
      // Cart
      addCartItem: (
        item: any,
        tableNo: string
      ) => Promise<void>;

      updateCartItemNote: (
        itemId: number,
        note: string,
        tableNo: string
      ) => Promise<any>;

      getCartItems: (
        tableNo: string
      ) => Promise<any[]>;

      removeCartItem: (
        uniqueKey: string,
        tableNo: string,
        removeAll?: boolean
      ) => Promise<any>;

      getAllUsers: () => Promise<any[]>;
      getOutlet: () => Promise<any | null>;
      clearCart: (
        tableNo: string
      ) => Promise<any>;

      //SYNC DATA
      syncAll: () => Promise<any>;
      getTables: () => Promise<any[]>;



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


      //================== BILL =======================
      insertBillItems: (items: any[]) => Promise<any>;

      getBillItems: (
        tableNo: string
      ) => Promise<any[]>;

      markBillItemsBilled: (
        tableNo: string,
        billId: string,
        billNo: string
      ) => Promise<any>;


      createBill: (input: {
        tableNo: string;
        tableName: string;
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



      // Orders
      getOrders: () => Promise<any[]>;

      getOrderById: (
        orderId: string
      ) => Promise<any>;

      getOrderItems: (
        orderId: string
      ) => Promise<any[]>;



      uploadOrderCounter: () => Promise<{
        success: boolean;
        invoiceSerialNo?: number;
        docId?: string;
        source?: string;
        error?: string;
      }>;


      print: (payload: {
        role: string;
        source?: 'POS' | 'WAITER' | 'SYSTEM';
        data: any;
      }) => Promise<{
        success: boolean;
        jobId?: string;
        error?: string;
      }>;


      // =====================================================
      // PRINTER SETTINGS
      // =====================================================
      getPrinterSettings: () => Promise<any[]>;

      savePrinterSetting: (
        config: any
      ) => Promise<{
        success: boolean;
      }>;





      getCurrentBusinessDay: () => Promise<any>;

      getDayClosingSummary: (
        businessDate: string
      ) => Promise<any>;

      getDayClosingHistory: () => Promise<any>;

      markTableHistoryPaid: (data: {
        tableNo: string;
        orderId: string;
        billItems: KitchenItem[];
      }) => Promise<{
        success: boolean;
        error?: string;
        paidItems?: number;
        deletedItems?: number;
        paidHistory?: number;
      }>;

      closeBusinessDay: (
        data: {
          actualCash: number;
          notes?: string;
          closedById?: string;
          closedByName?: string;
        }
      ) => Promise<any>;

            getAllUsers: () => Promise<any>;

      getPosLoginUsers: () => Promise<{
        success: boolean;
        users: Array<{
          userId: string;
          outletId: string;
          fullName: string;
          username: string;
          mobile: string;
          employeeId: string;
          role: string;
        }>;
        error?: string;
      }>;

      loginUser: (data: {
        userId: string;
        pin: string;
      }) => Promise<{
        success: boolean;
        user?: {
          userId: string;
          outletId: string;
          fullName: string;
          username: string;
          mobile: string;
          employeeId: string;
          role: string;
        };
        error?: string;
      }>;


      updateBillItemQuantity: (args: {
  tableNo: string;
  billItemGroupKey: string;
  quantity: number;
}) => Promise<any>;

createKot: (
  kotBatch: any,
  kotItems: {
    categoryName: string;
    productMode: string;
    currentStock: number;
    productId: string;
    name: string;
    categoryId: string;
    sessionId: string;
    tableNo: string;
    tableName: string;
    createdById: string;
    createdByName: string;
    parentId: string | null;
    isVariant: boolean;
    basePrice: number;
    finalPrice: number;
    modifierTotal: number;
    quantity: number;
    taxRate: number;
    taxType: "inclusive" | "exclusive";
    note: string;
    modifiersJson: string;
    createdAt: number;
    source: string;
    syncedToCloud: boolean;
    syncedFromCloud: boolean;
    id: string;
    kotNumber: any;
    kotBatchId: string;
    status: string;
    kitchenPrintReq: boolean;
    kitchenPrinted: boolean;
  }[]
) => Promise<any>;

getKotHistory: () => Promise<any>;

getKotHistoryDetail: (
  kotHistoryId: string
) => Promise<any>;

getOrdersByBusinessDate: (
  date: string
) => Promise<any>;

getOrdersByRealDate: (
  date: string
) => Promise<any>;
getSalesReport: (
  businessDate: string
) => Promise<any>;

onKotReceived: (
  callback: (data: any) => void
) => void;

onKotReceived: (
  callback: (data: any) => void
) => () => void;

generateNextPosOrderNumber: (
  orderType: string
) => Promise<string>;

previewBillImage: (data: {
  billNo: string;
  orderNo: string;
  tableNo: string;
  tableName: string;
  orderType: string;
  paymentMode: string;

  createdAt: number;

  items: {
    name: string;
    quantity: number;
    rate: number;
    amount: number;
    modifiers: any[];
    modifiersJson: string;
    note: string;
  }[];

  subtotal: number;
  tax: number;
  discount: number;
  deliveryFee: number;
  deliveryTax: number;
  grandTotal: number;

  outletName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;

  phone: string;
  phone2: string;
  gstVatNumber: string;

  taxMode: string;
  taxType: string;
  countryCode: string;

  customerName: string;
  customerPhone: string;

  qrEnabled: boolean;
  upiId: string;
  qrTitle: string;

  stewardName: string;
  kotNumberText: string;
}) => Promise<any>;

openFile: (
  filePath: string
) => Promise<void>;

generateNextKotNumber: () => Promise<string>;

getTodayPosOrders: (
  orderType: string
) => Promise<any[]>;


      // Modifiers
      getModifierGroups: () => Promise<any[]>;

      getProductModifiers: () => Promise<any[]>;
    };
  }
}