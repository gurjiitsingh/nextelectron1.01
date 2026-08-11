"use client";

import { useState, useEffect } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";

const PaymentSelectorPOS = () => {
  const { TEXT } = useLanguage();
  const { setPaymentType } = UseSiteContext();
  const [selected, setSelected] = useState<string>("");

  // Env flags
  const showStripe = process.env.NEXT_PUBLIC_PAYMENT_STRIPE_POS === "true";
  const showPayPal = process.env.NEXT_PUBLIC_PAYMENT_PAYPAL_POS === "true";
  const showCOD = process.env.NEXT_PUBLIC_PAYMENT_COD_POS === "true";
const showDigital = process.env.NEXT_PUBLIC_PAYMENT_DIGITAL_POS === "true";
  //  Select Cash by default
  useEffect(() => {
    if (showCOD) {
      setSelected("cod");
      setPaymentType("cod");
    }
  }, [showCOD, setPaymentType]);

  const handleSelect = (value: string) => {
    setSelected(value);
    setPaymentType(value);
  };

  return (
    <div className="flex flex-col p-5 rounded-2xl border border-slate-300 bg-white">
      <h3 className="text-xl font-semibold text-slate-600 pt-3 pb-4 uppercase">
        {TEXT.payment_method_title || "Select Payment Method"}
      </h3>

      <div className="flex flex-col gap-4">
        {/* Stripe */}
        {showStripe && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "stripe" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("stripe")}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "stripe" ? "border-amber-400" : "border-gray-400"}`}>
              {selected === "stripe" && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />}
            </div>
            <span className="text-blue-900 font-semibold">Stripe</span>
          </div>
        )}

        {/* PayPal */}
        {showPayPal && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "paypal" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("paypal")}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "paypal" ? "border-amber-400" : "border-gray-400"}`}>
              {selected === "paypal" && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />}
            </div>
            <span>
              <span className="text-blue-900 font-semibold">Pay</span>
              <span className="text-sky-500 font-semibold">Pal</span>
            </span>
          </div>
        )}
        {/* Digital Payment */}
        {showDigital && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "digital" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("digital")}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "digital" ? "border-amber-400" : "border-gray-400"}`}>
              {selected === "digital" && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />}
            </div>
            <span className="text-green-700 font-semibold">Digital Payment</span>
          </div>
        )}
        {/* Cash */}
        {showCOD && (
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
            ${selected === "cod" ? "border-amber-400 bg-amber-50" : "border-slate-300 hover:border-amber-300"}`}
            onClick={() => handleSelect("cod")}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected === "cod" ? "border-amber-400" : "border-gray-400"}`}>
              {selected === "cod" && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />}
            </div>
            <span className="text-slate-700 font-semibold">Pay with Cash</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSelectorPOS;
