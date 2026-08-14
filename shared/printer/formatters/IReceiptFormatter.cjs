import { PrinterPaperSize } from '../types';

export interface IReceiptFormatter<T = any> {
  format(data: T, paperSize: PrinterPaperSize): string;
}