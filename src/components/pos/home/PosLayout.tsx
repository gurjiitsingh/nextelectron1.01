"use client";

import { useState } from "react";
import { X } from "lucide-react";

import PosTopBar from "./PosTopBar";


import Products from "@/components/level-1/Products";
import PosSidebarCategories from "../PosSidebarCategories";
import CartPanel from "../CartPanel";

export default function PosLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [selectedTable, setSelectedTable] = useState("t1");

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">

      {/* TOP BAR */}
      <PosTopBar
        selectedTable={selectedTable}
        onTableChange={(table) => {
          setSelectedTable(table.id);

          console.log(
            "Selected table:",
            table.name
          );
        }}
        onMenuClick={() => {
          setSidebarOpen((prev) => !prev);
        }}
      />

      {/* MAIN POS AREA */}
      <div className="flex flex-1 min-h-0 relative">

        {/* MOBILE/TABLET OVERLAY */}
        {sidebarOpen && (
          <div
            className="
              xl:hidden
              fixed inset-0
              bg-black/30
              z-[80]
            "
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`
            fixed
            xl:relative
            z-[90]
            left-0
            top-[64px]
            xl:top-0
            bottom-0

            w-[250px]

            bg-white
            border-r
            border-slate-200

            transition-transform
            duration-200

            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full xl:-translate-x-full"
            }
          `}
        >
          {/* Sidebar header */}
          <div className="
            h-[52px]
            px-4
            flex items-center
            border-b border-slate-100
          ">
            <span className="
              text-sm
              font-semibold
              text-slate-700
            ">
              Categories
            </span>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="
                ml-auto
                xl:hidden
                w-8 h-8
                flex items-center justify-center
                rounded-lg
                hover:bg-slate-100
              "
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-[calc(100%-52px)] overflow-y-auto">
            <PosSidebarCategories />
          </div>
        </aside>

        {/* PRODUCTS */}
        <main className="flex-1 min-w-0 flex overflow-hidden">

          <section className="
            flex-1
            min-w-0
            overflow-y-auto
            p-4
          ">
            <Products />
          </section>

          {/* CART */}
          <aside className="
            hidden
            xl:flex
            w-[360px]
            shrink-0
            bg-white
            border-l
            border-slate-200
          ">
            <CartPanel />
          </aside>

        </main>
      </div>
    </div>
  );
}