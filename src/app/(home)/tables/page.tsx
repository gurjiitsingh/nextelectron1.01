'use client';

import { useEffect, useMemo, useState } from 'react';
 
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { useRouter } from 'next/navigation';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeTable, setActiveTable } = usePosSession();
  const { setRightSidebarView } = usePosUi();
 
const router = useRouter();

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

  // =====================================================
// GROUP TABLES BY AREA
// =====================================================
const tablesByArea = useMemo(() => {
  const grouped: Record<string, any[]> = {};

  for (const table of tables) {
    const area = table.area || 'General';

    if (!grouped[area]) {
      grouped[area] = [];
    }

    grouped[area].push(table);
  }

  // sort tables inside each area
  for (const area of Object.keys(grouped)) {
    grouped[area].sort((a, b) => {
      const aOrder = a.sortOrder ?? 9999;
      const bOrder = b.sortOrder ?? 9999;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return (a.tableName || '').localeCompare(
        b.tableName || ''
      );
    });
  }

  // sort area names alphabetically
  return Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b)
  );
}, [tables]);

function handleTableClick(table: any) {
  setActiveTable({
    tableId: table.id,
    tableName: table.tableName,
    status: table.status,
  });

  setRightSidebarView('cart');
   // navigate to POS page
setTimeout(() => {
    router.push('/');
  }, 50);
}

  return (
    <div className="p-4 h-screen overflow-y-auto">
      <div className='mb-40'>
      {/* <div className="mb-4 flex items-center justify-between ">
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
      </div> */}

      {loading ? (
        <p className="text-sm text-gray-500">
          Loading tables...
        </p>
      ) : (
   <div className="space-y-6">
  {tablesByArea.map(([area, areaTables]) => (
    <div key={area} className="space-y-3">
      {/* Area Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded bg-gray-100 px-3 py-2">
        <h2 className="text-sm font-semibold text-gray-800">
          {area}
        </h2>

        <span className="text-xs text-gray-500">
          {areaTables.length} tables
        </span>
      </div>

      {/* Area Tables */}
      <div className="grid grid-cols-3 gap-2 md:grid-cols-8 lg:grid-cols-13">
        {areaTables.map((table) => {
          const isActive =
            activeTable?.tableId === table.id;

          return (
            <button
              type="button"
              key={table.id}
              onClick={() => handleTableClick(table)}
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
              </div>

              <div className="mt-3 pt-2 text-xs text-gray-600">
                <div className="flex justify-between w-full bg-red-100 rounded-sm mb-1 p-1">
                 
                  <span>{table.cartCount}</span>
                </div>

                <div className="flex justify-between bg-orange-100 rounded-sm mb-1 p-1">
                  
                  <span>{table.billCount}</span>
                </div>

                <div className="mt-1 flex justify-between font-medium bg-green-100 rounded-sm p-1">
                  
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
    </div>
  ))}
</div>
      )}
      </div>
    </div>
  );
}