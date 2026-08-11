import { Timestamp, FieldValue } from "firebase/firestore";
import admin from "firebase-admin";

export type orderMasterDataT = {
  // =====================================================
  //  CORE OWNERSHIP & LOCATION (CRITICAL)
  // =====================================================

  ownerId: string; // 🔑 Restaurant owner (Auth UID)
  outletId: string; // 🔑 Restaurant location / branch

  // =====================================================
  //  CORE ORDER IDENTIFIERS
  // =====================================================

  id: string;
 srno: number; // Per-outlet running number

  // =====================================================
  //  CUSTOMER (REFERENCE + SNAPSHOT)
  // =====================================================

  customerId?: string; //  REAL customer (NULL for walk-in POS)
  customerName?: string;
  customerPhone?: string;
  customerCountryCode?: string;
  email?: string;

  addressId?: string; // Reference (optional)

  // 🔒 Snapshot for delivery / history:-- removed
  // ---------- Delivery Address (FLAT) ----------
  dAddressLine1?: string;
  dAddressLine2?: string;
  dCity?: string;
  dState?: string;
  dZipcode?: string;
  dLandmark?: string;

  // =====================================================
  //  ORDER TYPE
  // =====================================================

  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";
  tableNo: string | null; // Only for DINE_IN

  // =====================================================
  //  TIMESTAMPS
  // =====================================================

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
  closedAt?: Timestamp | FieldValue | null;

  isScheduled?: boolean;
  scheduledAt?: admin.firestore.Timestamp | admin.firestore.FieldValue | null;

  // =====================================================
  //  AMOUNTS (FINAL & AUDIT-SAFE)
  // =====================================================

  itemTotal: number; // Before discount & tax
  discountTotal?: number; // FINAL discount
  subTotal?: number; // After discount, before tax
  taxBeforeDiscount?: number;
  taxTotal?: number;
  deliveryFee?: number;
  grandTotal?: number; // FINAL payable

  // =====================================================
  //  PAYMENT
  // =====================================================

  // paymentType: string; // CASH | CARD | UPI | ONLINE
  // paymentProvider?: string; // STRIPE | PAYPAL | RAZORPAY
  // paymentMethod?: string; // VISA | GPAY | PHONEPE
  // paymentStatus?: "PAID" | "NEW" | "FAILED" | "REFUNDED";

  // =====================================================
//  PAYMENT
// =====================================================

paymentMode: 
  | "CASH"
  | "CARD"
  | "UPI"
  | "ONLINE"
  | "CREDIT"
  | "MIXED";

paymentProvider?: string; 
paymentMethod?: string;

paymentStatus?: 
  | "NEW"
  | "PAID"
  | "PARTIAL"
  | "CREDIT"
  | "FAILED"
  | "REFUNDED";

paidAmount?: number;  
dueAmount?: number;


  // =====================================================
  //  ORDER STATE
  // =====================================================

  orderStatus?:
    | "NEW"
    | "SCHEDULED"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  // =====================================================
  //  SOURCE & META
  // =====================================================

  source?: "WEB" | "POS" | "APP";
  staffId?: string | null; // POS cashier / waiter
  productsCount?: number;
  notes?: string;

  // =====================================================
  //  SYNC / OFFLINE (POS SAFE)
  // =====================================================

  syncStatus?: "NEW" | "SYNCED" | "FAILED";
  lastSyncedAt?: Timestamp | FieldValue;

  // =====================================================
  //  AUTOMATION
  // =====================================================

  printed?: boolean;
  acknowledged?: boolean;

  // ---------- Archival / Retention ----------
  // isArchived?: boolean;      //  default false / undefined
  // archivedAt?: Timestamp;    //  set only when archived

  // =====================================================
  // ⚠️ LEGACY FIELDS (KEEP, DO NOT USE FOR NEW LOGIC)
  // =====================================================

  couponCode?: string;
  //couponPercentPercentL?: number;
  //pickUpDiscountPercentL?: number;

  //totalDiscountG?: number;
  couponFlat?: number;
  pickUpDiscount?: number;
  couponPercent?: number;
};


export type TOrderMaster = {
  id: string;
  addressId: string;
  customerName: string;
  time: string;
  userId: string;
  status: string;
 srno: number;
};
