'use client';

import { useCartContext } from '@/store/CartContext';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BillMiniUi from '../BillMiniUi';

export default function CartPanelMulti() {

  const {
    cartData,
    reloadCart,
    productTotalCost,
    addProductToCart,
    decCartProduct,
    removeCartProduct,
    setCartData,
    tableNo,
  } = useCartContext();

  const router = useRouter();

  // =====================================================
  // VIEW TOGGLE (CART / KITCHEN)
  // =====================================================
  const [viewMode, setViewMode] = useState<
    'cart' | 'kitchen'
  >('cart');

  const [kitchenItems, setKitchenItems] =
    useState<any[]>([]);


  // =====================================================
  // LOAD KITCHEN ITEMS FOR CURRENT TABLE
  // =====================================================
  useEffect(() => {
    async function loadKitchen() {
      if (!tableNo) return;

      try {
        const rows =
          await window.posApi.getPendingKotByTable(
            tableNo
          );

        setKitchenItems(rows);
      } catch (e) {
        console.error(
          'Failed to load kitchen items',
          e
        );
      }
    }

    loadKitchen();
  }, [tableNo]);



  // =====================================================
  // SEND TO KITCHEN (KOT)
  // Location: src/components/CartPanel.tsx
  // Purpose: Save current cart items into pos_kot_items table
  // =====================================================
  async function sendToKitchenHandle() {
    if (cartData.length === 0) return;

    try {
      const kotBatchId = crypto.randomUUID();

      const kotNumber = `KOT-${Date.now()}`;

      const kotItems = cartData.map((item) => ({
        id: crypto.randomUUID(),

        kotNumber,

        categoryName:
          item.categoryName,

        productMode:
          item.productMode,

        currentStock:
          item.currentStock ?? 0,

        sessionId:
          item.sessionId,

        kotBatchId,

        tableNo:
          item.tableId,

        tableName:
          item.tableName,

        productId:
          item.productId,

        name: item.name,

        categoryId:
          item.categoryId,

        createdById:
          item.createdById ?? '',

        createdByName:
          item.createdByName ?? '',

        parentId:
          item.parentId ?? null,

        isVariant:
          item.isVariant ?? false,

        basePrice:
          item.basePrice,

        finalPrice:
          item.finalPrice,

        modifierTotal:
          item.modifierTotal ?? 0,

        quantity:
          item.quantity,

        taxRate:
          item.taxRate ?? 0,

        taxType:
          item.taxType ??
          'exclusive',

        status: 'PENDING',

        note: item.note ?? '',

        modifiersJson:
          item.modifiersJson ??
          JSON.stringify(
            item.modifiers ?? []
          ),

        kitchenPrintReq:
          item.kitchenPrintReq ??
          true,

        kitchenPrinted: false,

        createdAt: Date.now(),

        source: 'POS',

        syncedToCloud: false,

        syncedFromCloud: false,
      }));

      // Save into SQLite
      // Save into SQLite KOT table
      await window.posApi.insertKotItems(kotItems);

      console.log('KOT SAVED', kotBatchId);
      // =====================================================
      // CLEAR CART AFTER SUCCESSFUL SEND
      // Location: src/components/CartPanel.tsx
      // =====================================================

      // 1. Delete rows from SQLite
      await window.posApi.clearCart(tableNo ?? 'T1');

      // 2. Force React state to empty immediately
      setCartData([]);

      // 3. Reload from SQLite to stay in sync
      await reloadCart();

      // refresh kitchen list
      const rows =
        await window.posApi.getPendingKotByTable(
          tableNo ?? 'T1'
        );

      setKitchenItems(rows);

      // switch to kitchen view automatically
      setViewMode('kitchen');



      setKitchenItems(rows);

      // switch to kitchen view automatically
      setViewMode('kitchen');

      console.log(
        'KOT SAVED',
        kotBatchId
      );

      // alert(
      //   `Sent to kitchen (${kotItems.length} items)`
      // );
    } catch (e: any) {
      console.error('KOT SAVE FAILED', e);

      alert(
        'Failed to send items to kitchen: ' +
        (e?.message ?? JSON.stringify(e))
      );
    }
  }

  return (
    <aside className="relative flex h-[93%] w-full flex-col overflow-hidden">

      {/* Header */}
      {/* <div className="shrink-0 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="mt-1 text-xs text-gray-500">
        Table: {tableNo ?? "N/A"}
      </p>

        <span className="text-sm text-gray-500">
          {cartData.length} items
        </span>
      </div>

     
    </div> */}

      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 px-4 py-3">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('cart')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${viewMode === 'cart'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
              }`}
          >
            🛒 Cart
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kitchen')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${viewMode === 'kitchen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-slate-700 hover:bg-blue-100'
              }`}
          >
            🍳 Kitchen
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {viewMode === 'cart'
              ? 'Current Order'
              : 'Kitchen Orders'}
          </h2>

          <span className="text-sm text-gray-500">
            {viewMode === 'cart'
              ? `${cartData.length} items`
              : `${kitchenItems.length} sent`}
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          Table: {tableNo ?? 'N/A'}
        </p>
      </div>


      {/* Items */}
      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">

        {/* CART VIEW */}
        {viewMode === 'cart' ? (
          cartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-500">
                Cart is empty
              </p>
            </div>
          ) :  
          (<div>
            <div className="h-[320px] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {cartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center py-6">
                    <p className="text-sm text-gray-500">
                      Cart is empty
                    </p>
                  </div>
                ) : (
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

                            <div className="flex w-fit items-center overflow-hidden  border border-gray-300">

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
                )}
              </div>
            </div>
            {/* ACTION BAR */}
            <div className=" border-y border-gray-200 bg-gray-50 px-2 py-2 shadow-sm">

              <div className="grid grid-cols-3 gap-2">

                <button
                  type="button"
                  onClick={sendToKitchenHandle}
                  disabled={cartData.length === 0}
                  className={`h-9  text-xs font-semibold text-white ${cartData.length === 0
                    ? 'cursor-not-allowed bg-green-300'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  SEND
                </button>



                <button
                  type="button"
                  className="h-9  bg-red-500 text-xs font-semibold text-white hover:bg-red-600"
                >
                  CANCEL
                </button>



                <button
                  type="button"
                  className="h-9  border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  NOTE
                </button>



              </div>
            </div>

          </div>

          )
        ) : 
        <>
          <BillMiniUi tableNo='T1' />
        </>
        }
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
