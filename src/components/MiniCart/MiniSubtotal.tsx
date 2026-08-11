"use client";

import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import { useLanguage } from "@/store/LanguageContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";

export const MiniCartSubtotal = () => {
  const { TEXT } = useLanguage();
  const { cartData } = useContext(CartContext);
  const { settings } = UseSiteContext();

  const total = cartData.reduce((sum, item) => {
    return sum + item.quantity * parseFloat(String(item.price));
  }, 0);

  const totalFormatted = total.toFixed(2);

  const total_amount = formatCurrencyNumber(
    Number(totalFormatted) ?? 0,
    settings.currency as string,
    settings.locale as string
  );

  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 shadow-sm flex justify-between items-center">
      <div>
        <div className="text-gray-700 font-medium">{TEXT.total_label || "Total"}</div>
        <div className="text-sm text-gray-500">
          {/* {TEXT.discount_hint_checkout || "See discount at checkout"} */}
        </div>
      </div>
      <div className="text-slate-800 font-bold text-lg">{total_amount}</div>
    </div>
  );
};
