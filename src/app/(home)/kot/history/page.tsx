'use client';

import { useEffect, useState } from 'react';

type KotHistory = {
  id: string;
  kotBatchId: string;
  kotNumber: string;

  tableNo: string;
  tableName?: string;

  orderType: string;

  status: string;

  businessDate: string;

  createdAt: number;
  completedAt?: number | null;

  orderId?: string | null;
  billNo?: string | null;

  deviceId: string;
  deviceName?: string | null;
  appVersion?: string | null;

  sentBy?: string | null;

  syncStatus: string;
  lastSyncedAt?: number | null;
};

type KotHistoryItem = {
  id: string;

  kotHistoryId: string;
  kotNumber: string;

  tableNo: string;

  productId: string;
  name: string;

  categoryId?: string | null;
  categoryName?: string | null;

  parentId?: string | null;
  isVariant: number;

  productMode?: string | null;

  basePrice: number;
  quantity: number;

  modifierPrice: number;
  modifierSummary?: string | null;
  modifiersJson?: string | null;

  note?: string | null;

  taxRate: number;
  taxType: string;

  taxAmountPerItem: number;
  taxTotal: number;

  finalPricePerItem: number;
  finalTotal: number;

  status: string;

  source: string;

  createdAt: number;
  deletedAt?: number | null;

  syncStatus: string;
  lastSyncedAt?: number | null;
};

type KotHistoryDetail =
  KotHistory & {
    items: KotHistoryItem[];
  };

export default function KotHistoryPage() {

  const [history, setHistory] =
    useState<KotHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedKot, setSelectedKot] =
    useState<KotHistoryDetail | null>(null);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [search, setSearch] =
    useState('');

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  async function loadHistory() {

    try {

      setLoading(true);
      setError(null);

      const result =
        await window.posApi.getKotHistory();

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load KOT history'
        );
      }

      setHistory(
        result.data || []
      );

    } catch (error: any) {

      console.error(
        'LOAD KOT HISTORY FAILED',
        error
      );

      setError(
        error?.message ||
        'Failed to load KOT history'
      );

    } finally {

      setLoading(false);

    }
  }

  // =====================================================
  // LOAD DETAIL
  // =====================================================

  async function openKot(
    kotHistoryId: string
  ) {

    try {

      setLoadingDetail(true);


      const result1 =
  await window.posApi.getRecentKotHistoryItems(20);

console.log(
  'RECENT KOT HISTORY ITEMS:',
  result1
);

const history =
  await window.posApi.getKotHistory();

console.log(
  'KOT HISTORY:',
  history
);

      const result =
        await window.posApi.getKotHistoryDetail(
          kotHistoryId
        );

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load KOT'
        );
      }

      setSelectedKot(
        result.data || null
      );

    } catch (error: any) {

      console.error(
        'LOAD KOT DETAIL FAILED',
        error
      );

      alert(
        error?.message ||
        'Failed to load KOT'
      );

    } finally {

      setLoadingDetail(false);

    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadHistory();

  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredHistory =
    history.filter((kot) => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return true;
      }

      return (
        kot.kotNumber
          ?.toLowerCase()
          .includes(value) ||

        kot.tableNo
          ?.toLowerCase()
          .includes(value) ||

        kot.tableName
          ?.toLowerCase()
          .includes(value) ||

        kot.billNo
          ?.toLowerCase()
          .includes(value) ||

        kot.orderId
          ?.toLowerCase()
          .includes(value)
      );

    });

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    timestamp?: number | null
  ) {

    if (!timestamp) {
      return '-';
    }

    return new Date(timestamp)
      .toLocaleString();
  }

  // =====================================================
  // STATUS
  // =====================================================

  function statusClass(
    status: string
  ) {

    switch (
      status?.toUpperCase()
    ) {

      case 'PAID':
      case 'COMPLETED':

        return `
          bg-green-100
          text-green-700
        `;

      case 'PARTIAL':

        return `
          bg-yellow-100
          text-yellow-700
        `;

      case 'DELETED':

        return `
          bg-red-100
          text-red-700
        `;

      default:

        return `
          bg-gray-100
          text-gray-700
        `;
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="flex h-full min-h-0 flex-col">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="shrink-0 border-b px-5 py-4">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-lg font-semibold">
              KOT History
            </h1>

            <p className="mt-1 text-xs opacity-60">
              Previously sent kitchen orders
            </p>

          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="
              rounded-lg
              border
              px-4
              py-2
              text-xs
              font-medium
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            {loading
              ? 'Loading...'
              : 'Refresh'}
          </button>

        </div>

        {/* SEARCH */}

        <div className="mt-4">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="
              Search KOT, table, bill or order...
            "
            className="
              w-full
              rounded-lg
              border
              px-3
              py-2
              text-sm
              outline-none
              focus:ring-2
            "
          />

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto p-5">

        {/* ERROR */}

        {error && (

          <div className="
            mb-4
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          ">

            {error}

          </div>

        )}


        {/* LOADING */}

        {loading && (

          <div className="
            flex
            h-40
            items-center
            justify-center
            text-sm
            opacity-60
          ">

            Loading KOT history...

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          filteredHistory.length === 0 && (

            <div className="
              flex
              h-60
              items-center
              justify-center
              text-sm
              opacity-50
            ">

              No KOT history found.

            </div>

          )}


        {/* HISTORY LIST */}

        {!loading &&
          filteredHistory.length > 0 && (

            <div className="
              overflow-hidden
              rounded-xl
              border
            ">

              <div className="
                grid
                grid-cols-[100px_1fr_120px_130px_100px]
                border-b
                bg-gray-50
                px-4
                py-3
                text-xs
                font-semibold
              ">

                <span>KOT</span>

                <span>TABLE</span>

                <span>DATE</span>

                <span>BILL</span>

                <span>STATUS</span>

              </div>


              {filteredHistory.map(
                (kot) => (

                  <button
                    key={kot.id}
                    type="button"
                    onClick={() =>
                      openKot(kot.id)
                    }
                    className="
                      grid
                      w-full
                      grid-cols-[100px_1fr_120px_130px_100px]
                      items-center
                      border-b
                      px-4
                      py-3
                      text-left
                      transition
                      last:border-b-0
                      hover:bg-gray-50
                    "
                  >

                    {/* KOT NUMBER */}

                    <div>

                      <p className="
                        text-sm
                        font-bold
                      ">
                        {kot.kotNumber}
                      </p>

                    </div>


                    {/* TABLE */}

                    <div>

                      <p className="text-sm">

                        {kot.tableName ||
                          kot.tableNo}

                      </p>

                      {kot.tableName && (
                        <p className="
                          text-[10px]
                          opacity-50
                        ">
                          {kot.tableNo}
                        </p>
                      )}

                    </div>


                    {/* DATE */}

                    <span className="
                      text-xs
                      opacity-70
                    ">
                      {formatDate(
                        kot.createdAt
                      )}
                    </span>


                    {/* BILL */}

                    <span className="
                      text-xs
                      opacity-70
                    ">
                      {kot.billNo ||
                        '-'}
                    </span>


                    {/* STATUS */}

                    <span className={`
                      inline-flex
                      w-fit
                      rounded-full
                      px-2
                      py-1
                      text-[10px]
                      font-semibold
                      ${statusClass(
                        kot.status
                      )}
                    `}>

                      {kot.status}

                    </span>

                  </button>

                )
              )}

            </div>

          )}

      </div>


      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedKot && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/40
          p-4
        ">

          <div className="
            flex
            max-h-[90vh]
            w-full
            max-w-3xl
            flex-col
            overflow-hidden
            rounded-xl
            bg-white
            shadow-xl
          ">

            {/* DETAIL HEADER */}

            <div className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              px-5
              py-4
            ">

              <div>

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <h2 className="
                    text-lg
                    font-bold
                  ">
                    {selectedKot.kotNumber}
                  </h2>

                  <span className={`
                    rounded-full
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    ${statusClass(
                      selectedKot.status
                    )}
                  `}>

                    {selectedKot.status}

                  </span>

                </div>

                <p className="
                  mt-1
                  text-xs
                  opacity-60
                ">

                  {selectedKot.tableName ||
                    selectedKot.tableNo}

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedKot(null)
                }
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  hover:bg-gray-100
                "
              >
                ✕
              </button>

            </div>


            {/* DETAIL INFO */}

            <div className="
              grid
              shrink-0
              grid-cols-4
              gap-3
              border-b
              px-5
              py-4
            ">

              <div>

                <p className="
                  text-[10px]
                  opacity-50
                ">
                  KOT
                </p>

                <p className="text-sm font-semibold">
                  {selectedKot.kotNumber}
                </p>

              </div>


              <div>

                <p className="
                  text-[10px]
                  opacity-50
                ">
                  TABLE
                </p>

                <p className="text-sm font-semibold">
                  {selectedKot.tableName ||
                    selectedKot.tableNo}
                </p>

              </div>


              <div>

                <p className="
                  text-[10px]
                  opacity-50
                ">
                  BILL
                </p>

                <p className="text-sm font-semibold">
                  {selectedKot.billNo ||
                    '-'}
                </p>

              </div>


              <div>

                <p className="
                  text-[10px]
                  opacity-50
                ">
                  CREATED
                </p>

                <p className="text-sm font-semibold">
                  {formatDate(
                    selectedKot.createdAt
                  )}
                </p>

              </div>

            </div>


            {/* ITEMS */}

            <div className="
              min-h-0
              flex-1
              overflow-y-auto
              px-5
              py-4
            ">

              {loadingDetail ? (

                <div className="
                  flex
                  h-40
                  items-center
                  justify-center
                  text-sm
                  opacity-60
                ">

                  Loading items...

                </div>

              ) : (

                <div className="
                  overflow-hidden
                  rounded-lg
                  border
                ">

                  {selectedKot.items.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="
                          border-b
                          px-4
                          py-3
                          last:border-b-0
                        "
                      >

                        <div className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        ">

                          <div className="min-w-0">

                            <p className="
                              text-sm
                              font-semibold
                            ">

                              {item.name}

                            </p>

                            {item.modifierSummary && (

                              <p className="
                                mt-1
                                text-xs
                                opacity-60
                              ">
                                {item.modifierSummary}
                              </p>

                            )}

                            {item.note && (

                              <p className="
                                mt-1
                                text-xs
                                opacity-60
                              ">
                                Note: {item.note}
                              </p>

                            )}

                          </div>


                          <div className="
                            shrink-0
                            text-right
                          ">

                            <p className="
                              text-sm
                              font-semibold
                            ">

                              × {item.quantity}

                            </p>

                            <p className="
                              text-xs
                              opacity-60
                            ">

                              ₹
                              {Number(
                                item.finalTotal || 0
                              ).toFixed(2)}

                            </p>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* DETAIL FOOTER */}

            <div className="
              flex
              shrink-0
              items-center
              justify-between
              border-t
              px-5
              py-4
            ">

              <div className="text-xs opacity-50">

                Batch: {selectedKot.kotBatchId}

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedKot(null)
                }
                className="
                  rounded-lg
                  border
                  px-4
                  py-2
                  text-xs
                  font-semibold
                "
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}