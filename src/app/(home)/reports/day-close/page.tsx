'use client';

import { useEffect, useMemo, useState } from 'react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { useRouter } from 'next/navigation';

export default function DayClosingPage() {
const router = useRouter();
  const {
    background,
    theme,
  } = usePosTheme();

  const [businessDay, setBusinessDay] =
    useState<any>(null);

  const [summary, setSummary] =
    useState<any>(null);

  const [selectedDate, setSelectedDate] =
    useState('');

  const [actualCash, setActualCash] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [closing, setClosing] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');


  // =====================================================
  // LOAD CURRENT BUSINESS DAY
  // =====================================================

  useEffect(() => {
    loadBusinessDay();
  }, []);


  async function loadBusinessDay() {

    try {

      setLoading(true);
      setError('');
      setMessage('');

      const result =
        await window.posApi
          .getCurrentBusinessDay();

      console.log(
        'CURRENT BUSINESS DAY:',
        result
      );

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load business day'
        );
      }

      const day =
        result.data;

      setBusinessDay(day);

      setSelectedDate(
        day?.businessDate || ''
      );

      if (day?.businessDate) {
        await loadSummary(
          day.businessDate
        );
      }

    } catch (e: any) {

      console.error(
        'LOAD BUSINESS DAY FAILED',
        e
      );

      setError(
        e?.message ||
        'Failed to load business day'
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // LOAD SUMMARY
  // =====================================================

  async function loadSummary(
    date: string
  ) {

    if (!date) {
      return;
    }

    try {

      const result =
        await window.posApi
          .getDayClosingSummary(
            date
          );

      console.log(
        'DAY SUMMARY:',
        result
      );

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load summary'
        );
      }

      setSummary(
        result.data || {}
      );

    } catch (e: any) {

      console.error(
        'LOAD SUMMARY FAILED',
        e
      );

      setError(
        e?.message ||
        'Failed to load summary'
      );
    }
  }


  // =====================================================
  // DATE CHANGE
  // =====================================================

  async function handleDateChange(
    value: string
  ) {

    setSelectedDate(value);

    setError('');
    setMessage('');

    if (value) {
      await loadSummary(value);
    }
  }


  // =====================================================
  // VALUES
  // =====================================================

  const openingCash =
    Number(
      businessDay?.openingCash || 0
    );

  const cashSales =
    Number(
      summary?.cashSales || 0
    );

  const expectedCash =
    openingCash + cashSales;

  const actualCashValue =
    Number(actualCash || 0);

  const cashDifference =
    actualCash === ''
      ? 0
      : actualCashValue -
      expectedCash;


  // =====================================================
  // TOTALS
  // =====================================================

  const totalOrders =
    Number(
      summary?.totalOrders || 0
    );

  const totalSales =
    Number(
      summary?.totalSales || 0
    );

  const totalDiscount =
    Number(
      summary?.totalDiscount || 0
    );

  const totalTax =
    Number(
      summary?.totalTax || 0
    );

  const complimentarySales =
    Number(
      summary?.complimentarySales || 0
    );

  const cardSales =
    Number(
      summary?.cardSales || 0
    );

  const upiSales =
    Number(
      summary?.upiSales || 0
    );

  const walletSales =
    Number(
      summary?.walletSales || 0
    );

  const creditSales =
    Number(
      summary?.creditSales || 0
    );


  // =====================================================
  // CLOSE DAY
  // =====================================================

  async function handleCloseDay() {

    if (closing) {
      return;
    }

    setError('');
    setMessage('');

    if (!businessDay) {

      setError(
        'Business day is not loaded.'
      );

      return;
    }

    if (!actualCash.trim()) {

      setError(
        'Please enter actual cash counted.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Close business day ${businessDay.businessDate}?\n\n` +
        `Expected Cash: ₹${expectedCash.toFixed(2)}\n` +
        `Actual Cash: ₹${actualCashValue.toFixed(2)}\n` +
        `Difference: ₹${cashDifference.toFixed(2)}`
      );

    if (!confirmed) {
      return;
    }

    try {

      setClosing(true);

      const result =
        await window.posApi
          .closeBusinessDay({

            actualCash:
              actualCashValue,

            notes,

            closedById: '',
            closedByName: '',

          });

      console.log(
        'CLOSE DAY RESULT:',
        result
      );

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to close business day'
        );
      }

      setMessage(
        'Business day closed successfully.'
      );

      setActualCash('');
      setNotes('');

      await loadBusinessDay();

    } catch (e: any) {

      console.error(
        'CLOSE DAY FAILED',
        e
      );

      setError(
        e?.message ||
        'Failed to close business day'
      );

    } finally {

      setClosing(false);

    }
  }


  // =====================================================
  // MONEY FORMAT
  // =====================================================

  function money(
    value: number
  ) {

    return `₹${Number(
      value || 0
    ).toFixed(2)}`;
  }


  // =====================================================
  // DATE FORMAT
  // =====================================================

  function formatDate(
    value: string
  ) {

    if (!value) {
      return '-';
    }

    try {

      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

    } catch {

      return value;

    }
  }


  // =====================================================
  // TIME FORMAT
  // =====================================================

  function formatDateTime(
    value: number
  ) {

    if (!value) {
      return '-';
    }

    return new Date(
      value
    ).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div
        className={`
          min-h-screen
          ${background.className}
          ${background.text}
          flex
          items-center
          justify-center
          p-5
        `}
      >

        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            px-6
            py-5
            text-sm
            opacity-60
          `}
        >
          Loading business day...
        </div>

      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={`
    min-h-[calc(100vh-164px)]
    ${background.className}
    ${background.text}
    p-4
    pb-24
    md:p-5
    overflow-y-auto
  `}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={`
          mb-4
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          ${background.border}
          p-4
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        `}
      >

        <div>

          <h1
            className="
              text-xl
              font-bold
              tracking-tight
            "
          >
            Business Day Closing
          </h1>
          

          <p
            className="
              mt-1
              text-xs
              opacity-50
            "
          >
            Review today's sales and close the
            business day.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

     <label
  className={`
    flex
    h-10
    items-center
    gap-2
    rounded-xl
    border
    ${background.border}
    px-3
  `}
>
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => {
      console.log("DATE:", e.target.value);
      setSelectedDate(e.target.value);
    }}
    className="h-10 rounded-xl border px-3"
  />
</label>


          <button
            type="button"
            onClick={loadBusinessDay}
            disabled={loading}
            className="
              h-10
              rounded-xl
              px-4
              text-xs
              font-semibold
              text-white
              transition
              hover:opacity-90
              disabled:opacity-50
            "
            style={{
              backgroundColor:
                theme.primary,
            }}
          >
            ↻ Refresh
          </button>

          <button
  type="button"
  onClick={() => router.push('/orders/byBusinessDate')}
  disabled={loading}
  className="
    h-10
    rounded-xl
    px-4
    text-xs
    font-semibold
    text-white
    transition
    hover:opacity-90
    disabled:opacity-50
  "
  style={{
    backgroundColor: theme.primary,
  }}
>
  Order by Business Date
</button>

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <div
          className="
            mb-4
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
          "
        >
          {message}
        </div>

      )}


      {error && (

        <div
          className="
            mb-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
          "
        >
          {error}
        </div>

      )}


      {/* =================================================
          TOP SUMMARY
      ================================================= */}

      <div
        className="
          mb-4
          grid
          grid-cols-2
          gap-3
          md:grid-cols-4
        "
      >

        <SummaryCard
          title="Orders"
          value={String(totalOrders)}
          background={background}
        />

        <SummaryCard
          title="Total Sales"
          value={money(totalSales)}
          background={background}
        />

        <SummaryCard
          title="Discount"
          value={money(totalDiscount)}
          background={background}
        />

        <SummaryCard
          title="Tax"
          value={money(totalTax)}
          background={background}
        />

      </div>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div
        className="
          grid
          gap-4
          lg:grid-cols-2
        "
      >

        {/* =================================================
            BUSINESS INFORMATION
        ================================================= */}

        <SectionCard
          title="Business Information"
          background={background}
        >

          <InfoRow
            label="Business Date"
            value={formatDate(
              businessDay?.businessDate
            )}
          />

          <InfoRow
            label="Opened By"
            value={
              businessDay?.openedByName ||
              '-'
            }
          />

          <InfoRow
            label="Opened At"
            value={formatDateTime(
              businessDay?.openedAt
            )}
          />

          <InfoRow
            label="Opening Cash"
            value={money(
              openingCash
            )}
          />

        </SectionCard>


        {/* =================================================
            SALES SUMMARY
        ================================================= */}

        <SectionCard
          title="Sales Summary"
          background={background}
        >

          <MoneyRow
            label="Total Sales"
            value={totalSales}
          />

          <MoneyRow
            label="Discount"
            value={totalDiscount}
          />

          <MoneyRow
            label="Tax"
            value={totalTax}
          />

          <MoneyRow
            label="Complimentary"
            value={complimentarySales}
          />

          <div
            className="my-2 border-t"
            style={{
              borderColor:
                background.line,
            }}
          />

          <InfoRow
            label="Orders"
            value={String(
              totalOrders
            )}
          />

        </SectionCard>

      </div>


      {/* =================================================
          PAYMENT BREAKDOWN
      ================================================= */}

      <div className="mt-4">

        <SectionCard
          title="Payment Breakdown"
          background={background}
        >

          <div
            className="
              grid
              grid-cols-2
              gap-3
              md:grid-cols-5
            "
          >

            <PaymentCard
              title="Cash"
              value={cashSales}
            />

            <PaymentCard
              title="Card"
              value={cardSales}
            />

            <PaymentCard
              title="UPI"
              value={upiSales}
            />

            <PaymentCard
              title="Wallet"
              value={walletSales}
            />

            <PaymentCard
              title="Credit"
              value={creditSales}
            />

          </div>

        </SectionCard>

      </div>


      {/* =================================================
          CASH COUNT
      ================================================= */}

      <div className="mt-4">

        <SectionCard
          title="Cash Count"
          background={background}
        >

          <div
            className="
              grid
              gap-3
              md:grid-cols-3
            "
          >

            <MoneyBox
              title="Opening Cash"
              value={openingCash}
            />

            <MoneyBox
              title="Expected Cash"
              value={expectedCash}
            />

            <MoneyBox
              title="Cash Difference"
              value={cashDifference}
            />

          </div>


          <div
            className="
              mt-4
              grid
              gap-3
              md:grid-cols-2
            "
          >

            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  opacity-60
                "
              >
                Actual Cash Counted
              </label>

<input
  type="number"
  inputMode="decimal"
  step="0.01"
  min="0"
  value={actualCash}
  onChange={(e) => setActualCash(e.target.value)}
  placeholder="0.00"
  className={`
    h-11
    w-full
    rounded-xl
    border
    ${background.border}
    bg-transparent
    px-3
    text-sm
    font-semibold
    outline-none

    [appearance:textfield]
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `}
/>

            </div>


            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  opacity-60
                "
              >
                Notes
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Optional notes"
                className={`
                  h-11
                  w-full
                  rounded-xl
                  border
                  ${background.border}
                  bg-transparent
                  px-3
                  text-sm
                  outline-none
                `}
              />

            </div>

          </div>


          {/* =================================================
              CLOSE BUTTON
          ================================================= */}

          <div
            className="
              mt-4
              flex
              justify-end
            "
          >

            <button
              type="button"
              onClick={handleCloseDay}
              disabled={
                closing ||
                !businessDay
              }
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-xl
                px-5
                text-sm
                font-bold
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              style={{
                backgroundColor:
                  theme.primary,
              }}
            >

              🔒

              {closing
                ? 'Closing Day...'
                : 'Close Business Day'}

            </button>

          </div>

        </SectionCard>

      </div>

    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  background,
}: any) {

  return (

    <div
      className={`
        rounded-xl
        border
        ${background.border}
        p-3
        shadow-sm
      `}
    >

      <p
        className="
          text-[11px]
          uppercase
          tracking-wider
          opacity-45
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        {value}
      </p>

    </div>
  );
}


// =====================================================
// SECTION CARD
// =====================================================

function SectionCard({
  title,
  children,
  background,
}: any) {

  return (

    <div
      className={`
        rounded-2xl
        border
        ${background.border}
        p-4
        shadow-sm
      `}
    >

      <h2
        className="
          mb-3
          text-sm
          font-bold
        "
      >
        {title}
      </h2>

      <div
        className="border-t pt-3"
        style={{
          borderColor:
            background.line,
        }}
      >
        {children}
      </div>

    </div>
  );
}


// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        py-1.5
      "
    >

      <span
        className="
          text-xs
          opacity-55
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          font-semibold
          text-right
        "
      >
        {value}
      </span>

    </div>
  );
}


// =====================================================
// MONEY ROW
// =====================================================

function MoneyRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        py-1.5
      "
    >

      <span
        className="
          text-xs
          opacity-55
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          font-semibold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </span>

    </div>
  );
}


// =====================================================
// PAYMENT CARD
// =====================================================

function PaymentCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        p-3
      "
    >

      <p
        className="
          text-xs
          font-semibold
          opacity-55
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-lg
          font-bold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </p>

    </div>
  );
}


// =====================================================
// MONEY BOX
// =====================================================

function MoneyBox({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        p-3
      "
    >

      <p
        className="
          text-xs
          font-semibold
          opacity-55
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </p>

    </div>
  );
}