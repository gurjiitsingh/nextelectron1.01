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
      {/* Overlay — mobile & tablet only */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Cart Panel */}
      <aside
        className={`
          fixed lg:static top-0 right-0 h-full
          w-[250px] bg-white border-l border-gray-200
          z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Mobile / Tablet Header */}
        <div className="lg:hidden flex justify-between items-center p-3 border-b">
       
           <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Close cart"
          >
            <IoClose size={22} />
          </button>
          <h2 className="font-semibold">Cart</h2>

      
        </div>

        <POSCartContent />
      </aside>
    </>
  );
}
