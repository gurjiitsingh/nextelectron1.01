'use client';

import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { useCartContext } from '@/store/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPanel() {

  const {
    cartData,
    reloadCart,
    productTotalCost,
    addProductToCart,
    decCartProduct,
    removeCartProduct,
    setCartData,
  } = useCartContext();

  const { activeTable } = usePosSession();

  const router = useRouter();
  const {

    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // SEND TO KITCHEN (KOT)
  // =====================================================
  async function sendToKitchenHandle() {
    if (cartData.length === 0) return;

    try {
      const kotBatchId = crypto.randomUUID();
      const kotNumber = `KOT-${Date.now()}`;

      // =====================================================
      // COMMON ITEM DATA
      // =====================================================
     const currentTableId =
  activeTable?.tableId ??
  item.tableId ??
  'T1';

const currentTableName =
  activeTable?.tableName ??
  item.tableName ??
  'T1';

const commonItems = cartData.map((item) => ({
  categoryName: item.categoryName,
  productMode: item.productMode,
  currentStock: item.currentStock ?? 0,
  sessionId: item.sessionId,

  // IMPORTANT
  tableNo: currentTableId,
  tableName: currentTableName,
  tableId: currentTableId,

  productId: item.productId,
  name: item.name,
  categoryId: item.categoryId,
  createdById: item.createdById ?? '',
  createdByName: item.createdByName ?? '',
  parentId: item.parentId ?? null,
  isVariant: item.isVariant ?? false,
  basePrice: item.basePrice,
  finalPrice: item.finalPrice,
  modifierTotal: item.modifierTotal ?? 0,
  quantity: item.quantity,
  taxRate: item.taxRate ?? 0,
  taxType: item.taxType ?? 'exclusive',
  note: item.note ?? '',
  modifiersJson:
    item.modifiersJson ??
    JSON.stringify(item.modifiers ?? []),
  createdAt: Date.now(),
  source: 'POS',
  syncedToCloud: false,
  syncedFromCloud: false,
}));

      // =====================================================
      // KOT ITEMS (KITCHEN)
      // =====================================================
      const kotItems = commonItems.map((item) => ({
        id: crypto.randomUUID(),
        kotNumber,
        kotBatchId,
        status: 'PENDING',
        kitchenPrintReq: true,
        kitchenPrinted: false,
        ...item,
      }));

      // =====================================================
      // BILL ITEMS (BILLING)
      // =====================================================
      const billItems = commonItems.map((item) => ({
        id: crypto.randomUUID(),
        billItemGroupKey: [
          item.productId,
          item.basePrice,
          item.taxRate,
          item.taxType,
          item.note,
          item.modifiersJson,
        ].join('|'),
        status: 'OPEN',
        billed: false,
        billNo: '',
        billId: '',
        ...item,
      }));
console.log('BILL ITEMS PAYLOAD', billItems);
      // Save kitchen items
      await window.posApi.insertKotItems(kotItems);

      // Save bill items
      await window.posApi.insertBillItems(billItems);

      console.log('KOT SAVED', kotBatchId);
      console.log('BILL ITEMS SAVED', billItems.length);

     // Clear cart
    await window.posApi.clearCart(
  activeTable?.tableId ??
  activeTable?.tableName ??
  'T1'
);
//await window.posApi.clearCart(currentTableId);
      setCartData([]);
     await reloadCart(currentTableId);
      // Switch to kitchen view
      setRightSidebarView('bill');

    } catch (e: any) {
      console.error('KOT/BILL SAVE FAILED', e);

      alert(
        'Failed to send items to kitchen: ' +
        (e?.message ?? JSON.stringify(e))
      );
    }
  }

  return (
    <aside className="relative flex h-[93%] w-full flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 px-4 py-3">

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Current Order
          </h2>

          <span className="text-sm text-gray-500">
            {cartData.length} items
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
        Table: {activeTable?.tableName ?? 'N/A'}
        </p>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto app-scrollbar">

        {cartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              Cart is empty
            </p>
          </div>
        ) : (
          <div>
            <div className="h-full overflow-y-auto app-scrollbar">
              <div className="divide-y divide-gray-200">
                {cartData.map((item) => (
                  <div
                    key={`${item.productId}-${item.id}`}
                    className="px-2 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">

                      {/* Name + note */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-medium text-gray-900">
                          {item.name}
                        </p>

                        {item.note ? (
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {item.note}
                          </p>
                        ) : null}
                      </div>

                      {/* Unit price */}
                      <p className="shrink-0 whitespace-nowrap text-[9px] text-gray-900">
                        ₹{item.finalPrice.toFixed(2)}
                      </p>

                      {/* Amount + Qty */}
                      <div className="flex shrink-0 items-center gap-2">

                        <p className="whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{(item.finalPrice * item.quantity).toFixed(2)}
                        </p>

                        <div className="flex w-fit items-center overflow-hidden border border-gray-300">

                          <button
                            type="button"
                            onClick={() => decCartProduct(item)}
                            className="flex h-5 w-5 items-center justify-center text-gray-700 hover:bg-gray-100"
                          >
                            −
                          </button>

                          <span className="w-6 text-center text-[10px] font-medium">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              addProductToCart({
                                ...item,
                                quantity: 1,
                              })
                            }
                            className="flex h-5 w-5 items-center justify-center text-gray-700 hover:bg-gray-100"
                          >
                            +
                          </button>

                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>



          </div>
        )}
      </div>
      {/* ACTION BAR */}
      <div className="border-y border-gray-200 bg-gray-50 px-2 py-0 shadow-sm">

        <div className="grid grid-cols-3 gap-2">

          <button
            type="button"
            onClick={sendToKitchenHandle}
            disabled={cartData.length === 0}
            className={`h-9 text-xs font-semibold  text-white ${cartData.length === 0
              ? 'cursor-not-allowed bg-slate-300'
              : 'bg-orange-600 hover:bg-orange-700'
              }`}
          >
            SEND
          </button>

          <button
            type="button"
            className="h-9 bg-red-500 text-xs font-semibold text-white hover:bg-red-600"
          >
            CANCEL
          </button>

          <button
            type="button"
            className="h-9 border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            NOTE
          </button>

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">

        <div className="mb-3 flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>₹{productTotalCost.toFixed(2)}</span>
        </div>

      </div>

    </aside>
  );
}