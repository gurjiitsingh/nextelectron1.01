import {  cartProductType } from "../types/cartDataType";

export async function calculateTaxForCart(cartItems: cartProductType[]) {
  let subtotal = 0;
  let totalTax = 0; 

  const products = cartItems.map((item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    const itemSubtotal = price * qty; 
    const taxRate = item.taxRate ?? 0;
    const isExclusive = item.taxType === "exclusive";

    const lineSubtotal = price * qty;
    subtotal += lineSubtotal;

    let taxAmount = 0;
    let finalPrice = price;

    if (isExclusive) {
      taxAmount = price * (taxRate / 100);   // no rounding
      finalPrice = price + taxAmount;
    } else {
      taxAmount = price - price / (1 + taxRate / 100);
      finalPrice = price;
    }

    const taxTotal = taxAmount * qty;
    totalTax += taxTotal;

    return {
      ...item,
      itemSubtotal,
      taxAmount,
      taxTotal,
      finalPrice,
      finalTotal: finalPrice * qty,
    };
  });

  // 🔹 totals before rounding
  const grossTotal = subtotal + totalTax;

  // 🔹 ROUND TO NEAREST ₹0.05
  const roundedTotal =
    Math.round(grossTotal / 0.05) * 0.05;

  const roundingDifference = Number(
    (roundedTotal - grossTotal).toFixed(2)
  );

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grossTotal: Number(grossTotal.toFixed(2)),   // before rounding
    roundingDifference,                           // show on invoice
    payableTotal: Number(roundedTotal.toFixed(2)),
    products,
  };
}
