import { PrinterConfig } from '../config';

export interface IPrinterTransport {
  printText(config: PrinterConfig, text: string): Promise<boolean>;

  printImage(config: PrinterConfig, image: Buffer): Promise<boolean>;
}