'use client';

import { useMemo, useState } from 'react';

export type PaymentAllocationValue = {
  cash: number;
  card: number;
  upi: number;
  credit: number;
};

type PaymentAllocationProps = {
  totalAmount: number;
  initialPayment?: PaymentAllocationValue;
  onChange?: (
    payment: PaymentAllocationValue
  ) => void;
};

export default function PaymentAllocation({
  totalAmount,
  initialPayment,
  onChange,
}: PaymentAllocationProps) {

  const [cash, setCash] = useState(
    initialPayment?.cash || 0
  );

  const [card, setCard] = useState(
    initialPayment?.card || 0
  );

  const [upi, setUpi] = useState(
    initialPayment?.upi || 0
  );

  const [credit, setCredit] = useState(
    initialPayment?.credit || 0
  );

  const totalAllocated =
    cash +
    card +
    upi +
    credit;

  const remaining =
    Math.max(
      0,
      totalAmount - totalAllocated
    );

  const overAmount =
    Math.max(
      0,
      totalAllocated - totalAmount
    );

  const updatePayment = (
    field:
      | 'cash'
      | 'card'
      | 'upi'
      | 'credit',
    value: number
  ) => {

    const amount =
      Math.max(
        0,
        Number(value) || 0
      );

    let next = {
      cash,
      card,
      upi,
      credit,
    };

    next[field] = amount;

    setCash(next.cash);
    setCard(next.card);
    setUpi(next.upi);
    setCredit(next.credit);

    onChange?.(next);
  };

  const fillRemaining = (
    field:
      | 'cash'
      | 'card'
      | 'upi'
      | 'credit'
  ) => {

    const otherTotal =
      totalAllocated -
      (
        field === 'cash'
          ? cash
          : field === 'card'
            ? card
            : field === 'upi'
              ? upi
              : credit
      );

    const amount =
      Math.max(
        0,
        totalAmount - otherTotal
      );

    updatePayment(
      field,
      amount
    );
  };

  return (
    <div
      className="
        w-full
        rounded-lg
        border
        border-zinc-700
        bg-zinc-900
        p-3
        space-y-3
      "
    >

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex items-center justify-between">

        <span
          className="
            text-xs
            font-semibold
            text-zinc-300
          "
        >
          PAYMENT
        </span>

        <span
          className="
            text-sm
            font-bold
            text-white
          "
        >
          ₹{totalAmount.toFixed(2)}
        </span>

      </div>


      {/* =========================================
          CASH
      ========================================= */}

      <PaymentRow
        label="Cash"
        value={cash}
        onChange={(value) =>
          updatePayment('cash', value)
        }
        onFill={() =>
          fillRemaining('cash')
        }
      />


      {/* =========================================
          CARD
      ========================================= */}

      <PaymentRow
        label="Card"
        value={card}
        onChange={(value) =>
          updatePayment('card', value)
        }
        onFill={() =>
          fillRemaining('card')
        }
      />


      {/* =========================================
          UPI
      ========================================= */}

      <PaymentRow
        label="UPI"
        value={upi}
        onChange={(value) =>
          updatePayment('upi', value)
        }
        onFill={() =>
          fillRemaining('upi')
        }
      />


      {/* =========================================
          CREDIT
      ========================================= */}

      <PaymentRow
        label="Credit"
        value={credit}
        onChange={(value) =>
          updatePayment('credit', value)
        }
        onFill={() =>
          fillRemaining('credit')
        }
      />


      {/* =========================================
          SUMMARY
      ========================================= */}

      <div
        className="
          border-t
          border-zinc-700
          pt-2
          space-y-1
        "
      >

        <SummaryRow
          label="Allocated"
          value={totalAllocated}
        />

        <SummaryRow
          label="Remaining"
          value={remaining}
          valueClass={
            remaining > 0
              ? 'text-orange-400'
              : 'text-green-400'
          }
        />

        {overAmount > 0 && (
          <SummaryRow
            label="Over"
            value={overAmount}
            valueClass="text-red-400"
          />
        )}

      </div>

    </div>
  );
}


// =====================================================
// PAYMENT ROW
// =====================================================

type PaymentRowProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onFill: () => void;
};

function PaymentRow({
  label,
  value,
  onChange,
  onFill,
}: PaymentRowProps) {

  return (
    <div className="flex items-center gap-2">

      <div
        className="
          w-16
          text-xs
          text-zinc-300
        "
      >
        {label}
      </div>

      <input
        type="number"
        min="0"
        step="0.01"
        value={
          value === 0
            ? ''
            : value
        }
        onChange={(e) =>
          onChange(
            Number(e.target.value) || 0
          )
        }
        className="
          h-8
          flex-1
          rounded-md
          border
          border-zinc-700
          bg-zinc-800
          px-2
          text-right
          text-sm
          text-white
          outline-none
          focus:border-zinc-500
        "
        placeholder="0.00"
      />

      <button
        type="button"
        onClick={onFill}
        className="
          h-8
          px-2
          rounded-md
          bg-zinc-700
          text-[10px]
          font-semibold
          text-zinc-200
          hover:bg-zinc-600
        "
      >
        FULL
      </button>

    </div>
  );
}


// =====================================================
// SUMMARY ROW
// =====================================================

function SummaryRow({
  label,
  value,
  valueClass = 'text-white',
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      <span
        className="
          text-xs
          text-zinc-400
        "
      >
        {label}
      </span>

      <span
        className={`
          text-xs
          font-semibold
          ${valueClass}
        `}
      >
        ₹{value.toFixed(2)}
      </span>

    </div>
  );
}