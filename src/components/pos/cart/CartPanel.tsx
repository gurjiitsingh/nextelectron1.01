'use client';

import { cartProductType } from '@/lib/types/cartDataType';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { useCartContext } from '@/store/CartContext';
import { useState } from 'react';

export default function CartPanel() {

  const {
    cartData,
    reloadCart,
    productTotalCost,
    addProductToCart,
    decCartProduct,
    setCartData,
     updateCartItemNote,
  } = useCartContext();

  const {
    activeTable,
  } = usePosSession();

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


  const [editingNoteId, setEditingNoteId] =
  useState<number | null>(null);

const [noteText, setNoteText] =
  useState('');

  // =====================================================
  // SEND TO KITCHEN
  // =====================================================
async function sendToKitchenHandle() {

  // ---------------------------------------------------
  // VALIDATE CART
  // ---------------------------------------------------

  if (cartData.length === 0) {
    return;
  }


  // ---------------------------------------------------
  // VALIDATE TABLE
  // ---------------------------------------------------

  if (!activeTable?.tableId) {

    alert(
      'Please select a table first.'
    );

    return;
  }


  try {

    // =================================================
    // BASIC KOT INFORMATION
    // =================================================

    const kotBatchId =
      crypto.randomUUID();


    const kotNumber =
      await window.posApi.generateNextKotNumber();


    const currentTableId =
      activeTable.tableId;


    const currentTableName =
      activeTable.tableName || '';


    const now =
      Date.now();


    // =================================================
    // BUSINESS DATE
    // =================================================
    //
    // IMPORTANT:
    // KOT history requires businessDate.
    //
    // Use your existing business-date logic here if
    // you already have one.
    //
    // This fallback uses local calendar date.
    // =================================================

    const businessDate =
      new Date().toISOString().slice(0, 10);


    // =================================================
    // COMMON ITEM DATA
    // =================================================

    const commonItems =
      cartData.map((item) => ({

        // ------------------------------------------------
        // PRODUCT
        // ------------------------------------------------

        categoryName:
          item.categoryName || '',

        productMode:
          item.productMode || 'raw_stock',

        currentStock:
          Number(item.currentStock ?? 0),

        productId:
          item.productId,

        name:
          item.name || '',

        categoryId:
          item.categoryId || '',


        // ------------------------------------------------
        // SESSION
        // ------------------------------------------------
        sessionId:
          item.sessionId ?? null,
        // ------------------------------------------------
        // TABLE
        // ------------------------------------------------

        tableNo:
          currentTableId,

        tableName:
          currentTableName,


        // ------------------------------------------------
        // USER
        // ------------------------------------------------

        createdById:
          item.createdById ?? '',

        createdByName:
          item.createdByName ?? '',


        // ------------------------------------------------
        // VARIANT
        // ------------------------------------------------

        parentId:
          item.parentId ?? null,

        isVariant:
          item.isVariant ?? false,


        // ------------------------------------------------
        // PRICE
        // ------------------------------------------------

        basePrice:
          Number(item.basePrice ?? 0),

        finalPrice:
          Number(item.finalPrice ?? 0),

        modifierTotal:
          Number(item.modifierTotal ?? 0),


        // ------------------------------------------------
        // QUANTITY
        // ------------------------------------------------

        quantity:
          Number(item.quantity ?? 0),


        // ------------------------------------------------
        // TAX
        // ------------------------------------------------

        taxRate:
          Number(item.taxRate ?? 0),

        taxType:
          item.taxType || 'exclusive',


        // ------------------------------------------------
        // NOTE
        // ------------------------------------------------

        note:
          item.note ?? '',


        // ------------------------------------------------
        // MODIFIERS
        // ------------------------------------------------

        modifiersJson:
          item.modifiersJson ??
          JSON.stringify(
            item.modifiers ?? []
          ),


        // ------------------------------------------------
        // TIMESTAMP
        // ------------------------------------------------

        createdAt:
          now,


        // ------------------------------------------------
        // SOURCE
        // ------------------------------------------------

        source:
          'POS',


        // ------------------------------------------------
        // SYNC
        // ------------------------------------------------

        syncedToCloud:
          false,

        syncedFromCloud:
          false,

      }));


    // =================================================
    // CREATE KOT BATCH
    // =================================================

    const kotBatch = {

      id:
        kotBatchId,

      kotNumber:
        kotNumber,

      sessionId:
        cartData[0]?.sessionId ?? '',

      tableNo:
        currentTableId,

      tableName:
        currentTableName,

      orderType:
        'DINE_IN',

      businessDate,

      deviceId:
        'POS',

      deviceName:
        'Electron POS',

      appVersion:
        '1.0',

      createdAt:
        now,

      sentBy:
        null,

      syncStatus:
        'PENDING',

      lastSyncedAt:
        null,

    };


    // =================================================
    // CREATE KOT ITEMS
    // =================================================

    const kotItems =
      commonItems.map((item) => ({

        id:
          crypto.randomUUID(),

        kotNumber:
          kotNumber,

        kotBatchId:
          kotBatchId,

        status:
          'PENDING',

        kitchenPrintReq:
          true,

        kitchenPrinted:
          false,

        ...item,

      }));


    // =================================================
    // CREATE KOT
    // =================================================
    //
    // IMPORTANT:
    //
    // This now creates:
    //
    // 1. pos_kot_batch
    // 2. pos_kot_items
    // 3. pos_kot_history
    // 4. pos_kot_history_items
    //
    // in ONE SQLite transaction.
    //
    // Do NOT separately call:
    //
    // insertKotBatch()
    // insertKotItems()
    //
    // =================================================

    const kotResult =
      await window.posApi.createKot(
        kotBatch,
        kotItems
      );


    if (!kotResult?.success) {

      throw new Error(
        kotResult?.error ||
        'Failed to create KOT'
      );
    }


    // =================================================
    // CREATE BILL ITEMS
    // =================================================
    //
    // These remain OPEN until the actual bill is created.
    //
    // KOT ≠ BILL
    // =================================================

    const billItems =
      commonItems.map((item) => ({
        id:
          crypto.randomUUID(),
        billItemGroupKey: [
          item.productId,
          item.basePrice,
          item.taxRate,
          item.taxType,
          item.note,
          item.modifiersJson,
        ].join('|'),

        status:
          'OPEN',

        billed:
          false,

        billNo:
          '',

        billId:
          '',
        ...item,

      }));


    // =================================================
    // PRINT KOT
    // =================================================

    await window.posApi.print({

      role:
        'KITCHEN',

      source:
        'POS',

      data: {

        kotNumber:
          kotNumber,

        tableNo:
          currentTableId,

        tableName:
          currentTableName,

        orderType:
          'DINE_IN',

        createdAt:
          now,

        items:
          cartData.map((item) => ({

            name:
              item.name,

            quantity:
              item.quantity,

            note:
              item.note ?? '',

          })),

      },

    });


    // =================================================
    // SAVE BILL ITEMS
    // =================================================

    await window.posApi.insertBillItems(
      billItems
    );


    // =================================================
    // CLEAR CART
    // =================================================

    await window.posApi.clearCart(
      currentTableId
    );


    // =================================================
    // CLEAR LOCAL CART STATE
    // =================================================

    setCartData([]);


    // =================================================
    // RELOAD TABLE CART
    // =================================================

    await reloadCart(
      currentTableId
    );


    // =================================================
    // OPEN BILL PANEL
    // =================================================

    setRightSidebarView(
      'bill'
    );


  } catch (e) {

    console.error(
      'KOT/BILL SAVE FAILED',
      e
    );


    const message =
      e instanceof Error
        ? e.message
        : String(e);


    alert(
      `Failed to send items to kitchen.\n\n${message}`
    );

  }

}



function startEditingNote(
  item: cartProductType
) {
  setEditingNoteId(item.id);
  setNoteText(item.note ?? '');
}

function cancelEditingNote() {
  setEditingNoteId(null);
  setNoteText('');
}

async function saveItemNote(
  item: cartProductType
) {
  try {
    const tableNo =
      activeTable?.tableId || 'T1';

    await window.posApi.updateCartItemNote(
      item.id,
      noteText.trim(),
      tableNo
    );

    // Reload SQLite → React state
    await reloadCart(tableNo);

    setEditingNoteId(null);
    setNoteText('');

  } catch (error) {
    console.error(
      'FAILED TO UPDATE CART NOTE',
      error
    );

    alert(
      'Failed to save item note.'
    );
  }
}

  // =====================================================
  // UI
  // =====================================================

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
            ? activeTable.tableName
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

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          app-scrollbar
        "
      >

        {cartData.length === 0 ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >

            <p className="text-sm opacity-60">

              Cart is empty

            </p>

          </div>

        ) : (

          <div>

            <div
              className="
                h-full
                overflow-y-auto
                app-scrollbar
              "
            >

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

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      {/* =================================================
                          NAME + NOTE
                      ================================================= */}

               <div
  className="
    min-w-0
    flex-1
  "
>

  {/* PRODUCT NAME */}

  <p
    className="
      truncate
      text-[10px]
      font-medium
  "
  >
    {item.name}
  </p>


  {/* NOTE */}

  {editingNoteId === item.id ? (

    <div
      className="
        mt-1
        flex
        flex-col
        gap-1
      "
    >

      <input
        type="text"
        autoFocus
        value={noteText}
        onChange={(e) =>
          setNoteText(e.target.value)
        }
        onKeyDown={(e) => {

          if (e.key === 'Enter') {
            saveItemNote(item);
          }

          if (e.key === 'Escape') {
            cancelEditingNote();
          }

        }}
        placeholder="Customer note..."
        className={`
          w-full
          rounded
          border
          ${background.border}
          bg-transparent
          px-2
          py-1
          text-[10px]
          outline-none
        `}
      />

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <button
          type="button"
          onClick={() =>
            saveItemNote(item)
          }
          className="
            text-[9px]
            font-semibold
            opacity-80
            hover:opacity-100
          "
        >
          SAVE
        </button>

        <button
          type="button"
          onClick={
            cancelEditingNote
          }
          className="
            text-[9px]
            opacity-50
            hover:opacity-100
          "
        >
          CANCEL
        </button>

      </div>

    </div>

  ) : (

    <button
      type="button"
      onClick={() =>
        startEditingNote(item)
      }
      className="
        mt-0.5
        block
        max-w-full
        text-left
      "
    >

      {item.note ? (

        <span
          className="
            block
            truncate
            text-[9px]
            opacity-60
          "
        >
          📝 {item.note}
        </span>

      ) : (

        <span
          className="
            text-[9px]
            opacity-40
            hover:opacity-80
          "
        >
          + Add note
        </span>

      )}

    </button>

  )}

</div>


                      {/* =================================================
                          UNIT PRICE
                      ================================================= */}

                      <p
                        className="
                          shrink-0
                          whitespace-nowrap
                          text-[9px]
                          opacity-70
                        "
                      >

                        ₹
                        {Number(
                          item.finalPrice ?? 0
                        ).toFixed(2)}

                      </p>


                      {/* =================================================
                          AMOUNT + QTY
                      ================================================= */}

                      <div
                        className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                        "
                      >

                        <p
                          className="
                            whitespace-nowrap
                            text-sm
                            font-semibold
                          "
                        >

                          ₹
                          {(
                            Number(
                              item.finalPrice ?? 0
                            ) *
                            Number(
                              item.quantity ?? 0
                            )
                          ).toFixed(2)}

                        </p>


                        {/* =================================================
                            QUANTITY CONTROL
                        ================================================= */}

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
                            onClick={() =>
                              decCartProduct(item)
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
                            −
                          </button>


                          <span
                            className="
                              w-6
                              text-center
                              text-[10px]
                              font-medium
                            "
                          >
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
          ACTION BAR
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
            disabled={
              cartData.length === 0
            }
            style={{
              backgroundColor:
                cartData.length === 0
                  ? '#CBD5E1'
                  : theme.primary,

              color:
                '#FFFFFF',
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

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
            text-base
            font-semibold
          "
        >

          <span>
            Total
          </span>


          <span>

            ₹
            {productTotalCost.toFixed(2)}

          </span>

        </div>

      </div>

    </aside>
  );
}