'use client';

import { usePosUi } from '@/PosUiStore/PosUiContext';

import CartPanel from '../cart/CartPanel';
import KitchenView from '../kitchen/KitchenView';
// import BillView from '../bill/BillView';

export default function RightSideBar() {
  const {
    rightSidebarView,
    setRightSidebarView,
  } = usePosUi();

  return (
    <aside className="relative flex h-[93%] w-full flex-col overflow-hidden border-l border-gray-200 bg-white">

      {/* Top Switch Buttons */}
      <div className="shrink-0 border-b border-gray-200 p-2">
        <div className="grid grid-cols-3 gap-2">

          <button
            type="button"
            onClick={() =>
              setRightSidebarView('cart')
            }
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              rightSidebarView === 'cart'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
            }`}
          >
            🛒 Cart
          </button>

          <button
            type="button"
            onClick={() =>
              setRightSidebarView('kitchen')
            }
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              rightSidebarView === 'kitchen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
            }`}
          >
            🍳 Kitchen
          </button>

          <button
            type="button"
            onClick={() =>
              setRightSidebarView('bill')
            }
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              rightSidebarView === 'bill'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
            }`}
          >
            🧾 Bill
          </button>

        </div>
      </div>

      {/* Active View */}
      <div className="min-h-0 flex-1 overflow-hidden">

        {rightSidebarView === 'cart' && (
          <CartPanel />
        )}

        {rightSidebarView === 'kitchen' && (
          <KitchenView />
        )}

        {/* {rightSidebarView === 'bill' && (
          <BillView />
        )} */}

      </div>

    </aside>
  );
}