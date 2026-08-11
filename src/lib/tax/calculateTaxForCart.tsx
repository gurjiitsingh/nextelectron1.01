import { CartItem } from "../types/cartDataType";

export async function calculateTaxForCart(cartItems: CartItem[]) {
  let subtotal = 0;
  let totalTax = 0;

  const products = cartItems.map((item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    const taxRate = item.taxRate ?? 0;
    const isExclusive = item.taxType === "exclusive";

    const lineSubtotal = price * qty;
    subtotal += lineSubtotal;

    let taxAmount = 0;
    let finalPrice = price;

    if (isExclusive) {
      taxAmount = price * (taxRate / 100); // ❌ no rounding
      finalPrice = price + taxAmount;
    } else {
      taxAmount = price - price / (1 + taxRate / 100);
      finalPrice = price;
    }

    const taxTotal = taxAmount * qty;
    totalTax += taxTotal;

    return {
      ...item,
      taxAmount,     // keep raw (for display format later)
      taxTotal,
      finalPrice,
      finalTotal: finalPrice * qty,
    };
  });

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)), //  round once
    products,
  };
}
