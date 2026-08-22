const {
  PrinterConnectionType,
} = require('../types.ts');

const {
  LanPrinter,
} = require('./LanPrinter.cjs');

class TransportFactory {
  static create(config) {
    switch (config.connectionType) {
      case PrinterConnectionType.LAN:
        return new LanPrinter();

      case PrinterConnectionType.BLUETOOTH:
        throw new Error(
          'Bluetooth transport not implemented'
        );

      case PrinterConnectionType.USB:
        throw new Error(
          'USB transport not implemented'
        );

      default:
        throw new Error(
          'Unsupported transport'
        );
    }
  }
}

module.exports = {
  TransportFactory,
};