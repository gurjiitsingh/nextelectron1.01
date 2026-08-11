"use client";

import { useContext } from "react";
import CartContext from "@/store/CartContext";

export default function FloatingCartButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const { cartData } = useContext(CartContext);

  if (cartData.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-4 right-4 z-40
        lg:hidden
        bg-green-600 text-white
        px-5 py-3 rounded-full
        shadow-lg font-semibold
      "
    >
      🛒 {cartData.length}
    </button>
  );
}
