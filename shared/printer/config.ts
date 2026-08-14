import {
  PrinterConnectionType,
  PrinterPaperSize,
  ReceiptRenderMode,
  PrinterRole,
} from './types';

export interface PrinterConfig {
  role: PrinterRole;

  connectionType: PrinterConnectionType;
  paperSize: PrinterPaperSize;
  renderMode: ReceiptRenderMode;

  enabled: boolean;

  // LAN
  ip?: string;
  port?: number;

  // Bluetooth
  btAddress?: string;

  // USB
  usbVendorId?: number;
  usbProductId?: number;

  name?: string;
}