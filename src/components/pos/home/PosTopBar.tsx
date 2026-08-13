"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function PosTopBar() {
  const pathname = usePathname();

  const handleMenuClick = () => {
    window.dispatchEvent(
      new CustomEvent("pos-toggle-sidebar")
    );
  };

  const isPOS = pathname === "/";
  const isKOT = pathname.startsWith("/kot");

  return (
    <header
      className="
        h-[60px]
        shrink-0
        bg-white
        border-b border-slate-200
        flex items-center
        px-3
        relative
        z-[100]
      "
    >
      {/* BURGER */}
      <button
        type="button"
        onClick={handleMenuClick}
        className="
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-lg
          bg-slate-100
          hover:bg-slate-200
          active:scale-95
          transition
        "
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      {/* TITLE */}
      <div className="ml-3 mr-5">
        <div className="text-sm font-semibold text-slate-800">
          Restaurant POS
        </div>
      </div>

      {/* POS / KOT */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">

        <Link
          href="/"
          className={`
            px-4
            py-1.5
            rounded-md
            text-xs
            font-semibold
            transition
            ${
              isPOS
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          POS
        </Link>

        <Link
          href="/kot"
          className={`
            px-4
            py-1.5
            rounded-md
            text-xs
            font-semibold
            transition
            ${
              isKOT
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          KOT
        </Link>
        
     <Link
          href="/bill"
          className={`
            px-4
            py-1.5
            rounded-md
            text-xs
            font-semibold
            transition
            ${
              isKOT
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          BILL
        </Link>
      </div>
    </header>
  );
}