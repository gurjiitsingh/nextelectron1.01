"use client";

import { useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "react-use";
import { IoClose } from "react-icons/io5";
import { usePathname } from "next/navigation";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";

const framerSidebarPanel = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.3 },
};

export const SideCart = () => {
  const pathname = usePathname();

  const {
    open,
    sideBarToggle,
  } = UseSiteContext();

  const {
    theme,
    background,
  } = usePosTheme();

  const ref = useRef(null);

  useClickAway(ref, () => {
    sideBarToggle();
  });

  // =====================================================
  // CLOSE SIDEBAR AFTER LINK CLICK
  // =====================================================

  const handleLinkClick = () => {
    sideBarToggle();
  };

  // =====================================================
  // ACTIVE PATH
  // =====================================================

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  // =====================================================
  // SIDEBAR LINK
  // =====================================================

  const sidebarLinkClass = (href) => `
    block
    px-4
    py-2
    text-sm
    font-medium
    transition-colors
    cursor-pointer
  `;

  // =====================================================
  // SECTION TITLE
  // =====================================================

  const sectionTitleClass = `
    px-4
    py-2
    text-xs
    font-bold
    uppercase
    tracking-wide
  `;

  return (
    <div
      translate="no"
      className="z-50"
    >
      <AnimatePresence
        mode="wait"
        initial={false}
      >

        {open && (
          <motion.div
            {...framerSidebarPanel}
            ref={ref}
            className={`
              fixed
              top-[60px]
              bottom-0
              left-0
              z-50
              w-full
              max-w-[250px]
              h-[calc(100vh-60px)]
              shadow-2xl
              border-r
              flex
              flex-col
              overflow-y-auto
              app-scrollbar
              pos-sidebar-scroll
              ${background.className}
            `}
            style={{
              borderColor: theme.primarySelected,
            }}
            aria-label="Sidebar"
          >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div
              className="
                shrink-0
                flex
                items-center
                justify-between
                px-4
                py-2
                border-b
              "
              style={{
                borderColor: theme.primarySelected,
              }}
            >

              <span
                className="
                  text-lg
                  font-semibold
                "
                style={{
                  color: theme.primaryText,
                }}
              >
                POS
              </span>

              <button
                onClick={sideBarToggle}
                className="
                  p-2
                  rounded-lg
                  transition-colors
                "
                style={{
                  color: theme.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.primarySelected;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "transparent";
                }}
                aria-label="Close sidebar"
              >
                <IoClose size={24} />
              </button>

            </div>


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <div className="py-2">

              <div
                className={sectionTitleClass}
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                }}
              >
                Main
              </div>

              <Link
                href="/"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/")}
                style={{
                  color: isActive("/")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/")
                    ? 700
                    : 500,
                }}
              >
                POS
              </Link>

              <Link
                href="/tables"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/tables")}
                style={{
                  color: isActive("/tables")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/tables")
                    ? 700
                    : 500,
                }}
              >
                Tables
              </Link>

            </div>


            {/* ================================================= */}
            {/* ORDERS */}
            {/* ================================================= */}

            <div className="py-2">

              <div
                className={sectionTitleClass}
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                }}
              >
                Orders
              </div>

              <Link
                href="/orders/local"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/orders/local")}
                style={{
                  color: isActive("/orders/local")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/orders/local")
                    ? 700
                    : 500,
                }}
              >
                Local Orders
              </Link>

              <Link
                href="/orders/online"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/orders/online")}
                style={{
                  color: isActive("/orders/online")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/orders/online")
                    ? 700
                    : 500,
                }}
              >
                Online Orders
              </Link>

              <Link
                href="/kot/history"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/kot/history")}
                style={{
                  color: isActive("/kot/history")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/kot/history")
                    ? 700
                    : 500,
                }}
              >
                KOT History
              </Link>

            </div>


            {/* ================================================= */}
            {/* REPORTS */}
            {/* ================================================= */}

            <div className="py-2">

              <div
                className={sectionTitleClass}
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                }}
              >
                Reports
              </div>

              <Link
                href="/reports/day-close"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/reports/day-close")}
                style={{
                  color: isActive("/reports/day-close")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/reports/day-close")
                    ? 700
                    : 500,
                }}
              >
                Day Close
              </Link>

              <Link
                href="/reports/sales"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/reports/sales")}
                style={{
                  color: isActive("/reports/sales")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/reports/sales")
                    ? 700
                    : 500,
                }}
              >
                Sales / Z-Reports
              </Link>

            </div>


            {/* ================================================= */}
            {/* CUSTOMERS */}
            {/* ================================================= */}

            <div className="py-2">

              <div
                className={sectionTitleClass}
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                }}
              >
                Customers
              </div>

              <Link
                href="/customers"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/customers")}
                style={{
                  color: isActive("/customers")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/customers")
                    ? 700
                    : 500,
                }}
              >
                Customer List
              </Link>

            </div>


            {/* ================================================= */}
            {/* SYSTEM */}
            {/* ================================================= */}

            <div className="py-2">

              <div
                className={sectionTitleClass}
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                }}
              >
                System
              </div>

              <Link
                href="/sync"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/sync")}
                style={{
                  color: isActive("/sync")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/sync")
                    ? 700
                    : 500,
                }}
              >
                Sync
              </Link>

            </div>


            {/* ================================================= */}
            {/* SETTINGS */}
            {/* ================================================= */}

            <div className="py-2">

              <div
                className={sectionTitleClass}
                style={{
                  backgroundColor: theme.primary,
                  color: "#FFFFFF",
                }}
              >
                Settings
              </div>

              <Link
                href="/settings/theme"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/settings/theme")}
                style={{
                  color: isActive("/settings/theme")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/settings/theme")
                    ? 700
                    : 500,
                }}
              >
                Theme Setting
              </Link>

              <Link
                href="/settings/printer"
                onClick={handleLinkClick}
                className={sidebarLinkClass("/settings/printer")}
                style={{
                  color: isActive("/settings/printer")
                    ? theme.primary
                    : background.text === "text-white"
                      ? "#FFFFFF"
                      : "#334155",
                  fontWeight: isActive("/settings/printer")
                    ? 700
                    : 500,
                }}
              >
                Printer Setting
              </Link>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};