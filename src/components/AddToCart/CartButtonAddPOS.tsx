"use client";

import React, { useEffect, useState } from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { useCartContext } from "@/store/CartContext";
import { cartProductType } from "@/lib/types/cartDataType";

const CartButtonAdd = ({ cartProduct }: { cartProduct: cartProductType }) => {
  const [quantity, setQuantity] = useState<number>(0);

  const { addProductToCart, removeCartProduct, cartData } = useCartContext();

  const addToCartL = () => addProductToCart(cartProduct);
  const removeFromCartL = () => removeCartProduct(cartProduct);

  useEffect(() => {
    const item = cartData.find(
      (item: cartProductType) => item.id === cartProduct?.id
    );
    setQuantity(item?.quantity ?? 0);
  }, [cartData, cartProduct?.id]);

  return (
    <div className="flex items-center justify-end w-[72px]">
      {quantity > 0 ? (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-[2px]">
          {/* MINUS */}
          <button
            onClick={removeFromCartL}
            className="
              w-6 h-6
              flex items-center justify-center
              rounded-md
              bg-white
              shadow-sm
            "
          >
            <IoMdRemove size={14} className="text-gray-700" />
          </button>

          {/* QTY */}
          <span className="w-4 text-center text-xs font-semibold text-gray-700">
            {quantity}
          </span>

          {/* PLUS */}
          <button
            onClick={addToCartL}
            className="
              w-6 h-6
              flex items-center justify-center
              rounded-md
              bg-white
              shadow-sm
            "
          >
            <IoMdAdd size={14} className="text-gray-700" />
          </button>
        </div>
      ) : (
        <button
          onClick={addToCartL}
          className="
            w-[56px] h-7
            text-xs font-semibold
            rounded-lg
            bg-red-500
            text-white
            hover:bg-gray-200
          "
        >
          Add
        </button>
      )}
    </div>
  );
};

export default CartButtonAdd;
