'use client';

import { useEffect, useState } from 'react';

export default function TablesPage() {
const [tables, setTables] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
loadTables();
}, []);

async function loadTables() {
try {
setLoading(true);

 
  // Optional: sync before loading


  const rows = await window.posApi.getTables();

  setTables(rows);
} catch (e) {
  console.error('Failed to load tables', e);
} finally {
  setLoading(false);
}
 

}

return ( <div className="p-4"> <div className="mb-4 flex items-center justify-between"> <h1 className="text-xl font-semibold">Tables</h1>

```
    <button
      onClick={loadTables}
      className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
    >
      Refresh
    </button>
  </div>

  {loading ? (
    <p className="text-sm text-gray-500">Loading tables...</p>
  ) : (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {tables.map((table) => (
        <div
          key={table.id}
          className="rounded border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {table.tableName}
            </h2>

            <span
              className={`rounded px-2 py-0.5 text-xs ${
                table.status === 'AVAILABLE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {table.status}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Area: {table.area || 'General'}
          </p>

          <p className="text-xs text-gray-500">
            Guests: {table.guestsCount ?? 0}
          </p>

          {table.waiterName ? (
            <p className="text-xs text-gray-500">
              Waiter: {table.waiterName}
            </p>
          ) : null}

          <div className="mt-3 border-t pt-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Cart</span>
              <span>{table.cartCount}</span>
            </div>

            <div className="flex justify-between">
              <span>Kitchen</span>
              <span>{table.kitchenCount}</span>
            </div>

            <div className="flex justify-between">
              <span>Bill</span>
              <span>{table.billCount}</span>
            </div>

            <div className="mt-1 flex justify-between font-medium">
              <span>Amount</span>
              <span>₹{Number(table.billAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
 

);
}
