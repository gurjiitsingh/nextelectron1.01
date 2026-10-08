"use client";

import { useState } from "react";

export type BillItemData = {
  id: string;
  name: string;
  note?: string;
  quantity: number;
  basePrice: number;
  modifierTotal?: number;
};

type BillItemProps = {
  item: BillItemData;
  processing: boolean;

  onDecrease: (
    item: BillItemData,
    newQuantity: number,
    reason: string,
    cancelKitchen: boolean
  ) => void | Promise<void>;
  onIncrease: (item: BillItemData) => void | Promise<void>;

  onDelete?: (
    item: BillItemData,
    reason: string,
    cancelKitchen: boolean
  ) => void | Promise<void>;

  onUpdateQuantity?: (
    item: BillItemData,
    newQuantity: number
  ) => void | Promise<void>;
};

export default function BillItem({
  item,
  processing,
  onDecrease,
  onIncrease,
  onDelete,
  onUpdateQuantity,
}: BillItemProps) {
  const [editOpen, setEditOpen] = useState(false);

  const unitPrice =
    item.basePrice + (item.modifierTotal || 0);

  const totalPrice =
    unitPrice * item.quantity;

  const [reason, setReason] = useState("");
  const [cancelKitchen, setCancelKitchen] = useState(false);

  const handleDelete = async () => {
    const finalReason = reason.trim();

    // =============================================
    // REASON REQUIRED
    // =============================================

    if (!finalReason) {
      alert("Please enter a reason for deleting this item.");
      return;
    }

    console.log("========================================");
    console.log("DELETE ITEM");
    console.log("========================================");

    console.log("ITEM:", item);

    console.log("QUANTITY:", item.quantity);

    console.log("REASON:", finalReason);

    console.log(
      "CANCEL KITCHEN:",
      cancelKitchen
    );

    console.log("========================================");

    if (onDelete) {
      await onDelete(
        item,
        finalReason,
        cancelKitchen
      );
    }

    // Close popup after successful callback
    setEditOpen(false);

    // Clear popup values
    setReason("");

    setCancelKitchen(false);
  };

  const handleDecrease = async () => {
    const finalReason = reason.trim();

    if (!finalReason) {
      alert("Please enter a reason for decreasing the quantity.");
      return;
    }

    const currentQuantity = Number(item.quantity || 0);

    if (currentQuantity <= 1) {
      return;
    }

    const newQuantity = currentQuantity - 1;

    console.log("========================================");
    console.log("DECREASE BILL ITEM");
    console.log("========================================");
    console.log("ITEM:", item);
    console.log("ITEM ID:", item.id);
    console.log("PRODUCT ID:", (item as any)?.productId);
    console.log(
      "GROUP KEY:",
      (item as any)?.billItemGroupKey
    );
    console.log("CURRENT QUANTITY:", currentQuantity);
    console.log("NEW QUANTITY:", newQuantity);
    console.log("DECREASED QUANTITY:", 1);
    console.log("REASON:", finalReason);
    console.log("CANCEL KITCHEN:", cancelKitchen);
    console.log("========================================");

    if (onDecrease) {
      await onDecrease(
        item,
        newQuantity,
        finalReason,
        cancelKitchen
      );
    }

    setEditOpen(false);
    setReason("");
    setCancelKitchen(false);
  };

  const handleIncrease = () => {
    // TODO:
    // Open increase quantity + reason popup.
    onIncrease(item);
  };

  const handleMigrate = () => {
    // TODO:
    // Open migrate item to another table popup.
    console.log("Migrate item:", item);
  };

  return (
    <>
      {/* ================================================= */}
      {/* ITEM ROW */}
      {/* ================================================= */}

      <div
        className="
          px-3
          py-2
        "
      >
        <div className="flex items-center">

          {/* ============================================= */}
          {/* ITEM NAME */}
          {/* ============================================= */}

          <div className="min-w-0 flex-1">

            <p
              className="
                truncate
                text-[11px]
                font-medium
                leading-tight
                opacity-80
              "
            >
              {item.name}
            </p>

            {item.note ? (
              <p
                className="
                  mt-0.5
                  truncate
                  text-[10px]
                  leading-tight
                  opacity-40
                "
              >
                {item.note}
              </p>
            ) : null}

          </div>

          {/* ============================================= */}
          {/* QTY CONTROLS */}
          {/* ============================================= */}

          <div
            className="
              ml-2
              flex
              shrink-0
              items-center
              gap-0.5
            "
          >

            {/* DECREASE */}



            {/* QUANTITY */}

            <div
              className="
                flex
                min-w-[22px]
                justify-center
                text-[11px]
                font-medium
              "
            >
              {item.quantity}
            </div>

            {/* INCREASE */}



          </div>

          {/* ============================================= */}
          {/* EDIT / PENCIL */}
          {/* ============================================= */}

          <button
            type="button"
            disabled={processing}
            onClick={() => setEditOpen(true)}
            className="
              ml-2
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded
              text-[12px]
              opacity-50
              transition
              hover:bg-black/5
              hover:opacity-100
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
            title="Edit item"
          >
            ✎
          </button>

          {/* ============================================= */}
          {/* PRICE / TOTAL */}
          {/* ============================================= */}

          <div
            className="
              ml-2
              min-w-[70px]
              shrink-0
              text-right
            "
          >

            {/* TOTAL */}

            <p
              className="
                text-[12px]
                font-semibold
                leading-tight
                tabular-nums
                opacity-80
              "
            >
              ₹{totalPrice.toFixed(2)}
            </p>

            {/* UNIT PRICE */}

            <p
              className="
                mt-0.5
                text-[9px]
                leading-tight
                tabular-nums
                opacity-60
              "
            >
              ₹{unitPrice.toFixed(2)}
              {" / item"}
            </p>

          </div>

        </div>
      </div>

      {/* ================================================= */}
      {/* EDIT ITEM POPUP */}
      {/* ================================================= */}

      {editOpen ? (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
          onClick={() => setEditOpen(false)}
        >
          <div
            className="
              w-full
              max-w-[360px]
              overflow-hidden
              rounded-xl
              border
              bg-background
              shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* =========================================== */}
            {/* HEADER */}
            {/* =========================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-4
                py-3
              "
            >
              <div className="min-w-0">

                <p
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  Edit Item
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    opacity-50
                  "
                >
                  {item.name}
                </p>

              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded
                  text-[16px]
                  opacity-50
                  hover:opacity-100
                "
              >
                ×
              </button>

            </div>

            {/* =========================================== */}
            {/* FIRST ROW */}
            {/* DELETE / CANCEL KITCHEN / QTY */}
            {/* =========================================== */}

            <div className="mx-2 my-1">
              <label className="mb-1 block text-[10px] font-medium opacity-60">
                Reason
              </label>

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                className="h-8 w-full rounded-md border bg-transparent px-2 text-[11px] outline-none focus:ring-1"
              />
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                border-b
                px-3
                py-3
              "
            >

              {/* DELETE */}

              <button
                type="button"
                disabled={processing}
                onClick={handleDelete}
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[14px]
                  opacity-70
                  transition
                  hover:opacity-100
                  active:scale-95
                  disabled:opacity-30
                "
                title="Delete item"
              >
                🗑
              </button>

              {/* CANCEL KITCHEN */}

              <label
                className="
                  flex
                  min-w-0
                  flex-1
                  cursor-pointer
                  items-center
                  gap-1.5
                "
              >
                <input
                  type="checkbox"
                  checked={cancelKitchen}
                  onChange={(e) =>
                    setCancelKitchen(e.target.checked)
                  }
                  className="
    h-4
    w-4
    cursor-pointer
  "
                />

                <span
                  className="
                    whitespace-nowrap
                    text-[10px]
                    opacity-60
                  "
                >
                  Cancel Kitchen
                </span>
              </label>

              {/* DECREASE */}

              <button
                type="button"
                disabled={
                  processing ||
                  item.quantity <= 1
                }
                onClick={handleDecrease}
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[13px]
                  font-medium
                  opacity-70
                  transition
                  hover:opacity-100
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                −
              </button>

              {/* QUANTITY */}

              <div
                className="
                  flex
                  min-w-[24px]
                  justify-center
                  text-[12px]
                  font-semibold
                  tabular-nums
                "
              >
                {item.quantity}
              </div>

              {/* INCREASE */}

              <button
                type="button"
                disabled={processing}
                onClick={handleIncrease}
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[13px]
                  font-medium
                  opacity-70
                  transition
                  hover:opacity-100
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                +
              </button>

            </div>


            {/* =========================================== */}
            {/* SECOND ROW */}
            {/* MIGRATE ITEM */}
            {/* =========================================== */}

            <button
              type="button"
              disabled={processing}
              onClick={handleMigrate}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                transition
                hover:bg-black/5
                active:bg-black/10
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[14px]
                "
              >
                ⇄
              </span>

              <span className="flex-1">

                <span
                  className="
                    block
                    text-[11px]
                    font-medium
                  "
                >
                  Migrate item to another table
                </span>

                <span
                  className="
                    mt-0.5
                    block
                    text-[9px]
                    opacity-40
                  "
                >
                  Move this item to another table
                </span>

              </span>

              <span
                className="
                  text-[16px]
                  opacity-40
                "
              >
                ›
              </span>

            </button>

          </div>
        </div>
      ) : null}
    </>
  );
}