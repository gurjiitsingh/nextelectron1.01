'use client';

export default function TestPrinter() {
  async function handlePrint() {
    const result = await window.posApi.print({
      role: 'KITCHEN',
      source: 'POS',
      data: {
        kotNumber: 'KOT-0001',
        tableNo: 'T1',
        tableName: 'TABLE-1',
        orderType: 'DINE_IN',
        createdAt: Date.now(),
        items: [
          { name: 'Paneer Tikka', quantity: 2 },
          { name: 'Masala Dosa', quantity: 1, note: 'Less oil' },
        ],
      },
    });

    console.log(result);
    alert(JSON.stringify(result));
  }

  return (
    <button onClick={handlePrint}>
      Test Kitchen Print
    </button>
  );
}