"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCartContext } from "@/store/CartContext";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";

import { createNewOrder } from "@/app/(universal)/action/orders/dbOperations";

import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { calculateTaxForCart } from "@/lib/tax/calculateTaxForCart-withRounding";
import { calculateOrderTotals } from "@/lib/orderAmount/calculateOrderTotals";



import { CartItem, orderDataType } from "@/lib/types/cartDataType";
import { convertProductsToCartItemsPOS } from "@/lib/cart/convertProductsToCartItems";
import PaymentSelectorPOS from "./checkout/PaymentSelectorPOS";


// =====================================================
// POS CHECKOUT
// =====================================================

export default function POSCheckout() {
  const router = useRouter();
  const { TEXT } = useLanguage();

  const { cartData, setEndTotalG, orderType, tableNo } = useCartContext();

  const { settings, paymentType } = UseSiteContext();

  // -------------------------
  // LOCAL STATE
  // -------------------------
  const [itemTotal, setItemTotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);

  const [itemTotalFormatted, setItemTotalFormatted] = useState("");
  const [finalTotalFormatted, setFinalTotalFormatted] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // 🆕 STORE CONVERTED CART ITEMS (ORDER-SAFE)

  // =====================================================
  // CALCULATE TOTALS (SINGLE SOURCE OF TRUTH)
  // =====================================================
  useEffect(() => {
    if (!cartData || cartData.length === 0) return;

    async function calculateTotals() {
      // -------------------------
      // 1️⃣ TAX PER PRODUCT
      // -------------------------
      const { totalTax, products } = await calculateTaxForCart(cartData);

      // -------------------------
      // 2️⃣ ITEM TOTAL (NO TAX)
      // -------------------------
      const itemTotalInitial = products.reduce(
        (sum, p) => sum + Number(p.price) * Number(p.quantity),
        0
      );

      // -------------------------
      // 3️⃣ FINAL TOTALS (STANDARD)
      // -------------------------
      const totals = calculateOrderTotals({
        itemTotal: itemTotalInitial,
        couponFlat: 0,
        couponPercent: 0,
        pickupDiscount: 0,
        taxBeforeDiscount: totalTax,
        deliveryFee: 0,
      });

      // -------------------------
      // 4️⃣ SAVE STATE
      // -------------------------
      setItemTotal(Number(itemTotalInitial.toFixed(2)));
      setTaxTotal(Number(totals.taxTotal!.toFixed(2)));
      setEndTotalG(Number(totals.grandTotal!.toFixed(2)));

      // -------------------------
      // 5️⃣ FORMAT FOR UI
      // -------------------------
      if (settings?.currency && settings?.locale) {
        setItemTotalFormatted(
          formatCurrencyNumber(
            itemTotalInitial,
            settings.currency as string,
            settings.locale as string
          )
        );

        setFinalTotalFormatted(
          formatCurrencyNumber(
            totals.grandTotal!,
            settings.currency as string,
            settings.locale as string
          )
        );
      }
    }

    calculateTotals();
  }, [cartData, settings, setEndTotalG]);

  // =====================================================
  // CREATE POS ORDER
  // =====================================================
  async function createPOSOrder() {
    try {
      setIsLoading(true);

      if (!paymentType) {
        toast.error("Select payment method");
        return;
      }

      if (cartData.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      // -------------------------
      // FINAL TOTALS (REUSE LOGIC)
      // -------------------------
      const totals = calculateOrderTotals({
        itemTotal,
        couponFlat: 0,
        couponPercent: 0,
        pickupDiscount: 0,
        taxBeforeDiscount: taxTotal,
        deliveryFee: 0,
      });

      // -------------------------
      // ORDER PAYLOAD
      // -------------------------
      const posOrder: orderDataType = {
        userId: "POS",
        customerName: "POS",
        email: "pos@local",
        scheduledAt: "",
        orderType,
        tableNo,
        // CART SNAPSHOT
        cartData: cartData,

        // -------- CLEAN TOTALS --------
        itemTotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        subTotal: totals.subTotal,
        grandTotal: totals.grandTotal,

        // -------- LEGACY (KEEP) --------
      
       

        // -------- DISCOUNTS --------
        totalDiscountG: 0,
        couponFlat: 0,
        calcouponPercent: 0,

        //  REQUIRED BUT ZERO FOR POS
        flatcouponPercent: 0,
        noOffers: true,

        calculatedPickUpDiscountL: 0,

        addressId: "POS_ORDER",
        paymentType,
        deliveryFee: 0,

        couponPercentPercentL: 0,
        couponCode: "NA",
        pickUpDiscountPercentL: 0,

        // -------- SYSTEM --------
        source: "POS",
        orderStatus: "NEW",
        paymentStatus: "PAID",
        printed: false,
      };

      const orderResult = await createNewOrder(posOrder);

      if (!orderResult.success) {
        toast.error(orderResult.message || "Order failed");
        return;
      }

      router.push(
        `/pos/complete?paymentType=${paymentType}&orderMasterId=${orderResult.orderId}&deliveryType=pickup`
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="bg-white border rounded-2xl p-5 flex flex-col gap-4 w-full">
      <h2 className="text-xl font-semibold border-b pb-3">POS Checkout</h2>

      <PaymentSelectorPOS />

      <div className="flex justify-between text-md font-semibold">
        <span>Item Total</span>
        <span>{itemTotalFormatted}</span>
      </div>

      <div className="flex justify-between text-md font-semibold">
        <span>Tax</span>
        <span>
          {settings?.currency} {taxTotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-lg font-bold border-t pt-3">
        <span>Total</span>
        <span>{finalTotalFormatted}</span>
      </div>

      <button
        onClick={createPOSOrder}
        disabled={isLoading}
        className="w-full px-4 py-2 font-bold rounded-xl text-[1.2rem] bg-green-600 text-white hover:bg-green-700"
      >
        {isLoading ? "Processing..." : "Confirm POS Order"}
      </button>
    </div>
  );
}
