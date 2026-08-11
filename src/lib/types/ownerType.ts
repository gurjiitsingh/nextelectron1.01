import { FieldValue } from "firebase-admin/firestore";
import { Timestamp } from "firebase/firestore";

export type ownerDataT = {
  // ================================
  // CORE
  // ================================
  ownerId: string;           // Auth UID
  restaurantName: string;    // Brand name

  // ================================
  // CONTACT
  // ================================
  supportPhone?: string;
  supportEmail?: string;

  // ================================
  // TAX / LEGAL
  // ================================
  gstNumber?: string;        // India GST
  vatNumber?: string;        // Other countries

  // ================================
  // SETTINGS
  // ================================
  currency: string;          // INR, EUR, USD
  locale?: string;           // en-IN, de-DE

  // ================================
  // META
  // ================================
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;

  isActive: boolean;
};
