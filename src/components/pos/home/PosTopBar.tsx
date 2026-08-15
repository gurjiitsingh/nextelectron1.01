"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { usePosUi } from "@/PosUiStore/PosUiContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";

export default function PosTopBar() {
  const pathname = usePathname();

  const {
    theme,
    background,
  } = usePosTheme();

  const handleMenuClick = () => {
    window.dispatchEvent(
      new CustomEvent("pos-toggle-sidebar")
    );
  };

  const isPOS = pathname === "/";
  const isKOT = pathname.startsWith("/kot");
  const isOrders = pathname.startsWith("/orders");
  const isTables = pathname.startsWith("/tables");
  const isPrinter = pathname.startsWith("/settings/printer");
  const isSettings =
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  const {
    rightSidebarView,
    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // NAV BUTTON CLASS
  // =====================================================

  const navButtonClass = (active: boolean) =>
    `
      px-4
      py-1.5
      rounded-md
      text-xs
      font-semibold
      transition
      ${
        active
          ? "shadow-sm"
          : "hover:opacity-80"
      }
    `;

  return (
    <header
      className={`
        h-[60px]
        shrink-0
       
        flex
        items-center
        px-3
        relative
        z-[100]
        ${background.className}
        ${background.text}
         ${background.border}
      `}
      style={{
        borderColor: theme.primaryLight,
      }}
    >

      <div className="w-full flex justify-between items-center">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <div className="flex gap-3 items-center">

          {/* BURGER */}
          <button
            type="button"
            onClick={handleMenuClick}
            className={`
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-lg
              border
              transition
              active:scale-95
              hover:opacity-80
              ${background.className}
              ${background.text}
            `}
            style={{
              borderColor: theme.primaryLight,
            }}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          {/* TITLE */}
          <div className="ml-3 mr-5">
            <div
              className={`
                text-sm
                font-semibold
                ${background.text}
              `}
            >
              IT10x
            </div>
          </div>

          {/* ================================================= */}
          {/* MAIN NAVIGATION */}
          {/* ================================================= */}

          <div
            className={`
              flex
              items-center
              gap-1
              p-1
              rounded-lg
              ${background.className}
            `}
          >

            {/* POS */}
            <Link
              href="/"
              className={navButtonClass(isPOS)}
              style={{
                backgroundColor: isPOS
                  ? theme.primary
                  : "transparent",

                color: isPOS
                  ? "#FFFFFF"
                  : undefined,
              }}
            >
              POS
            </Link>

            {/* KOT */}
            <Link
              href="/kot"
              className={navButtonClass(isKOT)}
              style={{
                backgroundColor: isKOT
                  ? theme.primary
                  : "transparent",

                color: isKOT
                  ? "#FFFFFF"
                  : undefined,
              }}
            >
              KOT
            </Link>

            {/* ORDERS */}
            <Link
              href="/orders"
              className={navButtonClass(isOrders)}
              style={{
                backgroundColor: isOrders
                  ? theme.primary
                  : "transparent",

                color: isOrders
                  ? "#FFFFFF"
                  : undefined,
              }}
            >
              ORDERS
            </Link>

            {/* TABLES */}
            <Link
              href="/tables"
              className={navButtonClass(isTables)}
              style={{
                backgroundColor: isTables
                  ? theme.primary
                  : "transparent",

                color: isTables
                  ? "#FFFFFF"
                  : undefined,
              }}
            >
              TABLES
            </Link>

            {/* PRINTER */}
            <Link
              href="/settings/printer"
              className={navButtonClass(isPrinter)}
              style={{
                backgroundColor: isPrinter
                  ? theme.primary
                  : "transparent",

                color: isPrinter
                  ? "#FFFFFF"
                  : undefined,
              }}
            >
              Printer
            </Link>

            {/* SETTINGS */}
            <Link
              href="/settings"
              className={navButtonClass(isSettings)}
              style={{
                backgroundColor: isSettings
                  ? theme.primary
                  : "transparent",

                color: isSettings
                  ? "#FFFFFF"
                  : undefined,
              }}
            >
              Settings
            </Link>

          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT SIDEBAR SWITCH */}
        {/* ================================================= */}

        <div className="shrink-0 p-2">
          <div className="grid grid-cols-3 gap-2">

            {/* CART */}
            <button
              type="button"
              onClick={() =>
                setRightSidebarView("cart")
              }
              style={{
                backgroundColor:
                  rightSidebarView === "cart"
                    ? theme.primary
                    : undefined,

                color:
                  rightSidebarView === "cart"
                    ? "#FFFFFF"
                    : undefined,
              }}
              className={`
                rounded-lg
                px-2
                py-2
                text-sm
                font-medium
                transition-all
                hover:opacity-90
                active:opacity-80

                ${
                  rightSidebarView === "cart"
                    ? ""
                    : `${background.className} ${background.text}`
                }
              `}
            >
              🛒 Cart
            </button>

            {/* BILL */}
            <button
              type="button"
              onClick={() =>
                setRightSidebarView("bill")
              }
              style={{
                backgroundColor:
                  rightSidebarView === "bill"
                    ? theme.primary
                    : undefined,

                color:
                  rightSidebarView === "bill"
                    ? "#FFFFFF"
                    : undefined,
              }}
              className={`
                rounded-lg
                px-2
                py-2
                text-sm
                font-medium
                transition-all
                hover:opacity-90
                active:opacity-80

                ${
                  rightSidebarView === "bill"
                    ? ""
                    : `${background.className} ${background.text}`
                }
              `}
            >
              🧾 Bill
            </button>

            {/* KITCHEN */}
            <button
              type="button"
              onClick={() =>
                setRightSidebarView("kitchen")
              }
              style={{
                backgroundColor:
                  rightSidebarView === "kitchen"
                    ? theme.primary
                    : undefined,

                color:
                  rightSidebarView === "kitchen"
                    ? "#FFFFFF"
                    : undefined,
              }}
              className={`
                rounded-lg
                px-2
                py-2
                text-sm
                font-medium
                transition-all
                hover:opacity-90
                active:opacity-80

                ${
                  rightSidebarView === "kitchen"
                    ? ""
                    : `${background.className} ${background.text}`
                }
              `}
            >
              🍳 Kitchen
            </button>

          </div>
        </div>

      </div>
    </header>
  );
}