"use client";

import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import POSCartItem from "./POSCartItem";
import { Button } from "../ui/button";

import { useRouter } from "next/navigation";
import { MiniCartSubtotal } from "../MiniCart/MiniSubtotal";

const POSCartContent = () => {
  const { cartData } = useContext(CartContext);
const router = useRouter();
  return (
    <div className="flex flex-col gap-2 p-1">

      <div className="max-h-[70vh] overflow-y-auto ">
        {cartData.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Cart is empty</p>
        ) : (
          cartData.map((item, i) => (
            <POSCartItem key={i} item={item} />
          ))
        )}
      </div>

  {/* Place Order Button (PUT HERE) */}

   <MiniCartSubtotal />

           <button
  onClick={() => router.push("/pos/checkout")}
  className="w-full px-4 py-3 font-bold bg-green-600 text-white rounded-xl text-lg"
>
  Place Order
</button>
    </div>
  );
};

export default POSCartContent;
