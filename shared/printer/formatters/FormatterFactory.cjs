const {
  PrinterPaperSize,
  PrinterRole,
} = require('../types.js');

const {
  KitchenFormatter58,
} = require('./KitchenFormatter58.cjs');

const {
  KitchenFormatter80,
} = require('./KitchenFormatter80.cjs');

class FormatterFactory {
  static createKitchenFormatter(paperSize) {
    switch (paperSize) {
      case PrinterPaperSize.MM58:
        return new KitchenFormatter58();

      case PrinterPaperSize.MM80:
      default:
        return new KitchenFormatter80();
    }
  }

  static create(role, paperSize) {
    switch (role) {
      case PrinterRole.KITCHEN:
        return this.createKitchenFormatter(paperSize);

      case PrinterRole.BILL:
        throw new Error(
          'Bill formatter not implemented yet'
        );

      case PrinterRole.BAR:
        throw new Error(
          'Bar formatter not implemented yet'
        );

      default:
        throw new Error(
          'Unsupported printer role'
        );
    }
  }
}

module.exports = {
  FormatterFactory,
};