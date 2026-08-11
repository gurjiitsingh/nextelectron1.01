"use client";

import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import Image from "next/image";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { CartItemWithTax, cartProductType } from "@/lib/types/cartDataType";

const POSCartItem = ({ item }: { item: cartProductType }) => {

  
  const { addProductToCart, decCartProduct, removeCartProduct } =
    useContext(CartContext);

  const { settings } = UseSiteContext();

  function inc() {
    addProductToCart({ ...item, quantity: 1 });
  }

  const total = item.quantity *item.price;
  const totalFormatted = formatCurrencyNumber(
    total,
    settings.currency as string,
    settings.locale as string
  );

  const priceFormatted = formatCurrencyNumber(
    item.price,
    settings.currency as string,
    settings.locale as string
  );

  return (
    <div className="p-1 rounded-xl bg-white  border border-gray-100 flex gap-1 transition-all">
      {/* Image */}
      {item.image ? (
        <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
          No image
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex justify-between items-start">
          <h3 className="text-sm  text-gray-800 leading-tight max-w-[150px]">
            {item.name}
          </h3>
          <p className="text-sm  text-gray-700">
            {priceFormatted}
          </p>
        </div>

        {/* {item.productDesc && (
          <p className="text-xs text-gray-500 leading-tight">
            {item.productDesc}
          </p>
        )} */}

        {/* Quantity */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 gap-2">
            <button
              onClick={() => removeCartProduct(item)}
              className="p-1 bg-white rounded-full shadow hover:bg-gray-200"
            >
              <IoMdRemove size={16} />
            </button>

            <span className="text-sm font-semibold w-6 text-center">
              {item.quantity}
            </span>

            <button
              onClick={inc}
              className="p-1 bg-white rounded-full shadow hover:bg-gray-200"
            >
              <IoMdAdd size={16} />
            </button>
          </div>

          <div className="text-sm font-bold text-rose-600">
            {totalFormatted}
          </div>
        </div>

        {/* Remove */}
        {/* <button
          onClick={() => removeCartProduct(item)}
          className="text-xs text-gray-400 hover:text-red-500 mt-1"
        >
          Remove
        </button> */}
      </div>
    </div>
  );
};

export default POSCartItem;
