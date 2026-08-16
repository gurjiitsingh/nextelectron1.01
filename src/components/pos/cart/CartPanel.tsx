'use client';

import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
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
  // POS THEME
  // =====================================================

  const {
    theme,
    background,
  } = usePosTheme();

  // =====================================================
  // SEND TO KITCHEN (KOT)
  // =====================================================

  async function sendToKitchenHandle() {

    if (cartData.length === 0) return;

    // NEVER send without a selected table
    if (!activeTable?.tableId) {
      alert('Please select a table first.');
      return;
    }

    try {

      const kotBatchId = crypto.randomUUID();
      const kotNumber = `KOT-${Date.now()}`;

      const currentTableId = activeTable.tableId;
      const currentTableName = activeTable.tableName;

      const commonItems = cartData.map((item) => ({
        categoryName: item.categoryName,
        productMode: item.productMode,
        currentStock: item.currentStock ?? 0,
        sessionId: item.sessionId,

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

      const kotItems = commonItems.map((item) => ({
        id: crypto.randomUUID(),

        kotNumber,
        kotBatchId,

        status: 'PENDING',

        kitchenPrintReq: true,
        kitchenPrinted: false,

        ...item,
      }));

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

      await window.posApi.insertKotItems(kotItems);

      await window.posApi.print({
        role: 'KITCHEN',
        source: 'POS',

        data: {
          kotNumber,

          tableNo: currentTableId,
          tableName: currentTableName,

          orderType: 'DINE_IN',

          createdAt: Date.now(),

          items: cartData.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            note: i.note ?? '',
          })),
        },
      });

      await window.posApi.insertBillItems(billItems);

      await window.posApi.clearCart(currentTableId);

      setCartData([]);

      await reloadCart(currentTableId);

      setRightSidebarView('bill');

    } catch (e) {

      console.error(
        'KOT/BILL SAVE FAILED',
        e
      );

      alert(
        'Failed to send items to kitchen: '
      );
    }
  }
  // console.log("background.border---------------",background.border)
  //   // =====================================================
  //   // UI
  //   // =====================================================
  //   console.log('===== POS THEME DEBUG =====');
  // console.log('background:', background);
  // console.log('backgroundName:', backgroundName);
  // console.log('background keys:', Object.keys(background));
  // console.log('background.border:', background.border);
  // console.log('background.className:', background.className);
  // console.log('===========================');

  return (
    <aside
      className={`
        relative
        flex
        h-[93%]
        w-full
        flex-col
        overflow-hidden
        ${background.className}
        ${background.text}
      `}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={`
          flex
          justify-between
          shrink-0
          border-b
          ${background.border}
          px-4
          py-3
        `}
      >

        <p className="mt-1 text-xs">
          {activeTable
            ? `${activeTable.tableName}`
            : 'No table selected'}
        </p>

        <div className="flex items-center justify-between">

          <span className="text-sm">
            {cartData.length} items
          </span>

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto app-scrollbar">

        {cartData.length === 0 ? (

          <div className="flex h-full items-center justify-center">

            <p className="text-sm opacity-60">
              Cart is empty
            </p>

          </div>

        ) : (

          <div>

            <div className="h-full overflow-y-auto app-scrollbar">

              {/* DIM ITEM DIVIDERS */}

              <div
                className={`
                  divide-y
                  ${background.divide}
                `}
              >

                {cartData.map((item) => (

                  <div
                    key={`${item.productId}-${item.id}`}
                    className={`
      px-2
      py-2
      border-b
      ${background.border}
    `}
                  >

                    <div className="flex items-center justify-between gap-3">

                      {/* NAME + NOTE */}
                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[10px] font-medium">
                          {item.name}
                        </p>

                        {item.note && (
                          <p className="mt-0.5 truncate text-xs opacity-60">
                            {item.note}
                          </p>
                        )}

                      </div>


                      {/* UNIT PRICE */}
                      <p className="shrink-0 whitespace-nowrap text-[9px] opacity-70">
                        ₹{item.finalPrice.toFixed(2)}
                      </p>


                      {/* AMOUNT + QTY */}
                      <div className="flex shrink-0 items-center gap-2">

                        <p className="whitespace-nowrap text-sm font-semibold">
                          ₹{(
                            item.finalPrice *
                            item.quantity
                          ).toFixed(2)}
                        </p>


                        {/* QUANTITY CONTROL */}
                        <div
                          className={`
            flex
            w-fit
            items-center
            overflow-hidden
            border
            ${background.border}
          `}
                        >

                          <button
                            type="button"
                            onClick={() => decCartProduct(item)}
                            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              opacity-70
              transition
              hover:opacity-100
            "
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
                            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              opacity-70
              transition
              hover:opacity-100
            "
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


      {/* =================================================
          ACTION BAR // ${background.border}
      ================================================= */}

      <div
        className={`
          border-t
          ${background.border}
          px-2
          py-2
          shadow-sm
        `}
      >

        <div className="grid grid-cols-3 gap-2">

          <button
            type="button"
            onClick={sendToKitchenHandle}
            disabled={cartData.length === 0}
            style={{
              backgroundColor:
                cartData.length === 0
                  ? '#CBD5E1'
                  : theme.primary,

              color: '#FFFFFF',
            }}
            className="
              h-9
              text-xs
              font-semibold
              transition-all
              rounded-lg
              hover:opacity-90
              active:opacity-80
              disabled:cursor-not-allowed
            "
          >
            SEND
          </button>

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className={`
          shrink-0
        
          ${background.border}
          px-4
          py-3
        `}
      >

        <div className="mb-3 flex items-center justify-between text-base font-semibold">

          <span>
            Total
          </span>

          <span>
            ₹{productTotalCost.toFixed(2)}
          </span>

        </div>

      </div>

    </aside>
  );
}