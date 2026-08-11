'use client';

import { useCartContext } from '@/store/CartContext';
 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPanel() {
  const {
    cartData,
    productTotalCost,
    addProductToCart,
    decCartProduct,
    removeCartProduct,
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
    await window.posApi.insertKotItems(
      kotItems
    );

    // refresh kitchen list
const rows =
  await window.posApi.getPendingKotByTable(
    tableNo ?? 'T1'
  );

setKitchenItems(rows);

// switch to kitchen view automatically
setViewMode('kitchen');

    console.log(
      'KOT SAVED',
      kotBatchId
    );

    alert(
      `Sent to kitchen (${kotItems.length} items)`
    );
  } catch (e) {
    console.error(
      'KOT SAVE FAILED',
      e
    );

    alert(
      'Failed to send items to kitchen'
    );
  }
}

return (
  <aside className="relative flex h-[93%] w-full flex-col overflow-hidden">

    {/* Header */}
    <div className="shrink-0 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="mt-1 text-xs text-gray-500">
        Table: {tableNo ?? "N/A"}
      </p>

        <span className="text-sm text-gray-500">
          {cartData.length} items
        </span>
      </div>

     
    </div>


    {/* Items */}
    <div className="min-h-0 flex-1 overflow-y-auto pb-28">
      {cartData.length === 0 ? (
        <div className="flex h-full items-center justify-center">
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

                  <div className="flex w-fit items-center overflow-hidden rounded-md border border-gray-300">

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


    {/* ACTION BAR */}
    <div className="absolute left-0 right-0 top-[50%] z-20 border-y border-gray-200 bg-gray-50 px-2 py-2 shadow-sm">

      <div className="grid grid-cols-3 gap-2">

     <button
  type="button"
  onClick={sendToKitchenHandle}
  disabled={cartData.length === 0}
  className={`h-9 rounded-md text-xs font-semibold text-white ${
    cartData.length === 0
      ? 'cursor-not-allowed bg-green-300'
      : 'bg-green-600 hover:bg-green-700'
  }`}
>
  SEND
</button>

        <button
          type="button"
          className="h-9 rounded-md bg-yellow-500 text-xs font-semibold text-white hover:bg-yellow-600"
        >
          HOLD
        </button>

        <button
          type="button"
          className="h-9 rounded-md bg-red-500 text-xs font-semibold text-white hover:bg-red-600"
        >
          CANCEL
        </button>

        <button
          type="button"
          className="h-9 rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          DISCOUNT
        </button>

        <button
          type="button"
          className="h-9 rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          NOTE
        </button>

        <button
          type="button"
          className="h-9 rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
        >
          MORE
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
