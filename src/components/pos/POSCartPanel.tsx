"use client";

import POSCartContent from "./POSCartContent";
import { IoClose } from "react-icons/io5";

export default function POSCartPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop Overlay — Mobile & Tablet viewports */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Modern Slide-Over Cart Panel */}
      <aside
        className={`
          fixed lg:static top-0 right-0 h-full
          w-80 sm:w-96 lg:w-[380px]
          bg-white border-l border-slate-200/80
          z-50 flex flex-col shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
          select-none
        `}
      >
        {/* Panel Header */}
        <div className="flex justify-between items-center px-4 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-base tracking-tight">
              Current Order
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600">
              POS
            </span>
          </div>

          {/* Close Action Button for Mobile/Tablet overlay */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Cart Content Wrapper */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
          <POSCartContent />
        </div>
      </aside>
    </>
  );
}