"use client";

import { useState } from "react";
import { Menu, ChevronDown, X } from "lucide-react";

type Table = {
  id: string;
  name: string;
  seats: number;
  status: "available" | "occupied" | "reserved";
};

const tables: Table[] = [
  { id: "t1", name: "T1", seats: 2, status: "available" },
  { id: "t2", name: "T2", seats: 2, status: "occupied" },
  { id: "t3", name: "T3", seats: 4, status: "available" },
  { id: "t4", name: "T4", seats: 4, status: "available" },
  { id: "t5", name: "T5", seats: 4, status: "occupied" },
  { id: "t6", name: "T6", seats: 6, status: "available" },
  { id: "t7", name: "T7", seats: 2, status: "reserved" },
  { id: "t8", name: "T8", seats: 4, status: "available" },
  { id: "t9", name: "T9", seats: 6, status: "available" },
];

export default function PosTopBar() {
  const [showTables, setShowTables] = useState(false);

  const [selectedTable, setSelectedTable] = useState<Table>(
    tables[0]
  );

  const handleMenuClick = () => {
    window.dispatchEvent(
      new CustomEvent("pos-toggle-sidebar")
    );
  };

  return (
    <>
      <header
        className="
          h-[64px]
          shrink-0
          bg-white
          border-b border-slate-200
          flex items-center
          px-4
          gap-3
          relative
          z-[100]
        "
      >
        {/* BURGER */}
        <button
          type="button"
          onClick={handleMenuClick}
          className="
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            bg-slate-100
            hover:bg-slate-200
            active:scale-95
            transition
          "
        >
          <Menu size={23} />
        </button>

        {/* POS TITLE */}
        <div className="hidden md:flex flex-col mr-3">
          <span className="text-sm font-semibold text-slate-800">
            Restaurant POS
          </span>

          <span className="text-xs text-slate-400">
            Dine In
          </span>
        </div>

        {/* TABLE BUTTON */}
        <button
          type="button"
          onClick={() => setShowTables(true)}
          className="
            flex items-center gap-3
            min-w-[155px]
            px-3 py-2
            rounded-xl
            border border-slate-200
            bg-slate-50
            hover:bg-slate-100
            transition
          "
        >
          <div
            className="
              w-9 h-9
              rounded-lg
              bg-slate-800
              text-white
              flex items-center justify-center
              text-sm font-bold
            "
          >
            {selectedTable.name}
          </div>

          <div className="flex-1 text-left">
            <div className="text-[11px] text-slate-400">
              Current Table
            </div>

            <div className="text-sm font-semibold text-slate-800">
              {selectedTable.name}
            </div>
          </div>

          <ChevronDown
            size={18}
            className="text-slate-400"
          />
        </button>
      </header>

      {/* TABLE FLOOR PLAN */}
      {showTables && (
        <div
          className="
            fixed inset-0
            z-[200]
            bg-black/40
            flex items-center justify-center
            p-6
          "
          onMouseDown={() => setShowTables(false)}
        >
          <div
            className="
              w-full
              max-w-[850px]
              bg-white
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div
              className="
                h-[64px]
                px-5
                flex items-center
                border-b border-slate-200
              "
            >
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Select Table
                </h2>

                <p className="text-xs text-slate-400">
                  Select a table from the floor
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTables(false)}
                className="
                  ml-auto
                  w-9 h-9
                  rounded-lg
                  flex items-center justify-center
                  hover:bg-slate-100
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* LEGEND */}
            <div
              className="
                px-5 py-3
                border-b border-slate-100
                flex gap-6
                text-xs
              "
            >
              <Legend
                className="bg-emerald-100 border-emerald-300"
                text="Available"
              />

              <Legend
                className="bg-red-100 border-red-300"
                text="Occupied"
              />

              <Legend
                className="bg-amber-100 border-amber-300"
                text="Reserved"
              />
            </div>

            {/* FLOOR */}
            <div className="p-6 bg-slate-50">
              <div
                className="
                  relative
                  h-[480px]
                  rounded-2xl
                  border-2 border-dashed
                  border-slate-200
                  bg-white
                  overflow-hidden
                "
              >
                <div
                  className="
                    absolute
                    top-5
                    left-5
                    text-xs
                    font-semibold
                    text-slate-300
                    uppercase
                    tracking-widest
                  "
                >
                  Main Dining Area
                </div>

                {tables.map((table, index) => {
                  const positions = [
                    [80, 80],
                    [220, 80],
                    [360, 80],

                    [80, 220],
                    [220, 220],
                    [380, 220],

                    [80, 360],
                    [220, 360],
                    [380, 360],
                  ];

                  const [left, top] = positions[index];

                  const selected =
                    selectedTable.id === table.id;

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => {
                        setSelectedTable(table);
                        setShowTables(false);
                      }}
                      style={{
                        left,
                        top,
                      }}
                      className={`
                        absolute
                        w-[100px]
                        h-[75px]
                        rounded-xl
                        border-2
                        flex
                        flex-col
                        items-center
                        justify-center
                        transition
                        hover:scale-105
                        active:scale-95

                        ${
                          table.status === "available"
                            ? "bg-emerald-50 border-emerald-300"
                            : table.status === "occupied"
                            ? "bg-red-50 border-red-300"
                            : "bg-amber-50 border-amber-300"
                        }

                        ${
                          selected
                            ? "ring-4 ring-slate-800/10 border-slate-800"
                            : ""
                        }
                      `}
                    >
                      <span className="text-base font-bold text-slate-800">
                        {table.name}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {table.seats} seats
                      </span>

                      <span className="text-[9px] uppercase font-semibold mt-1 text-slate-400">
                        {table.status}
                      </span>
                    </button>
                  );
                })}

                {/* ENTRANCE */}
                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    -translate-x-1/2
                    px-8 py-2
                    bg-slate-100
                    rounded-t-lg
                    text-xs
                    text-slate-400
                  "
                >
                  Entrance
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Legend({
  className,
  text,
}: {
  className: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full border ${className}`}
      />

      <span className="text-slate-500">
        {text}
      </span>
    </div>
  );
}