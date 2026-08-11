"use client";

import { useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CartContext from "@/store/CartContext";
import {
  decreaseProductStockFromOrder,
  updateOrderMaster,
} from "@/app/(universal)/action/orders/dbOperations";

const MAINTAIN_STOCK = process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true";

export default function POSOrderComplete() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderMasterId");
  const router = useRouter();

  const { emptyCart } = useContext(CartContext);

  // 🔥 Auto print receipt
  function autoPrint() {
    try {
      window.print();
    } catch (e) {
      console.log("Auto print failed:", e);
    }
  }

  useEffect(() => {
    async function finalizePosOrder() {
      if (!orderId) return;

      await updateOrderMaster(orderId, "COMPLETED");

      if (MAINTAIN_STOCK) await decreaseProductStockFromOrder(orderId);

      emptyCart();

      // 🔥 Trigger auto print
      setTimeout(() => {
        autoPrint();
      }, 300);

      // 🔥 Auto redirect back to POS home
      setTimeout(() => {
        router.push("/pos");
      }, 1500);
    }

    finalizePosOrder();
  }, [orderId]);

  return (
    <div className="w-full h-[80vh] flex justify-center items-center">
      <div className="bg-white shadow-lg px-10 py-8 rounded-xl text-center">
        <h1 className="text-3xl font-bold text-green-600">Order Completed</h1>
        <p className="mt-2 text-gray-500">Printing receipt...</p>

        <div className="mt-6 flex flex-col gap-3">
          {/* Manual fallback print button */}
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-gray-200 rounded-lg text-gray-700"
          >
            Print Again
          </button>

          <button
            onClick={() => router.push("/pos")}
            className="px-5 py-2 bg-green-600 text-white rounded-lg"
          >
            Return to POS
          </button>
        </div>
      </div>
    </div>
  );
}
