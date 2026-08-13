'use client';

import { useEffect, useState } from 'react';
 
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeTable, setActiveTable } = usePosSession();
  const { setRightSidebarView } = usePosUi();

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      setLoading(true);

      // Optional: sync before loading
      // await window.posApi.syncAll();

      const rows = await window.posApi.getTables();

      setTables(rows);
    } catch (e) {
      console.error('Failed to load tables', e);
    } finally {
      setLoading(false);
    }
  }

function handleTableClick(table: any) {
  setActiveTable({
    tableId: table.id,
    tableName: table.tableName,
    status: table.status,
  });

  setRightSidebarView('cart');
}

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tables</h1>

          {activeTable ? (
            <p className="text-sm text-blue-600">
              Selected: {activeTable.tableName}
            </p>
          ) : null}
        </div>

        <button
          onClick={loadTables}
          className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">
          Loading tables...
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {tables.map((table) => {
             

              const isActive =
  activeTable?.tableId === table.id;

            return (
              <button
                type="button"
                key={table.id}
                onClick={() =>
                  handleTableClick(table)
                }
                className={`rounded border bg-white p-3 text-left shadow-sm transition-all ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
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
                    <span>
                      ₹{Number(
                        table.billAmount || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}