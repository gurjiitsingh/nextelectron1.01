
'use client';

import { useState } from 'react';

import LANPrinter from './LANPrinter';
import USBPrinter from './USBPrinter';
import BluetoothPrinter from './BluetoothPrinter';

type PrinterType = 'LAN' | 'USB' | 'BLUETOOTH';

export default function BillPrinterPage() {
  const [selectedPrinter, setSelectedPrinter] =
    useState<PrinterType>('LAN');

  return (
    <div className="p-6">
      {/* Navigation buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setSelectedPrinter('LAN')}
          className="rounded-lg border px-5 py-3"
        >
          LAN
        </button>

        <button
          onClick={() => setSelectedPrinter('USB')}
          className="rounded-lg border px-5 py-3"
        >
          USB
        </button>

        <button
          onClick={() => setSelectedPrinter('BLUETOOTH')}
          className="rounded-lg border px-5 py-3"
        >
          Bluetooth
        </button>
      </div>

      {/* Load only the selected component */}
      {selectedPrinter === 'LAN' && <LANPrinter />}

      {selectedPrinter === 'USB' && <USBPrinter />}

      {selectedPrinter === 'BLUETOOTH' && (
        <BluetoothPrinter />
      )}
    </div>
  );
}
