export function generateCartHtml(
  items: { name: string; quantity: number; price: number }[],
  endTotalG: number
) {
  let totalAmount = 0;

  let cartHtml = `
    <h1 style="color: #64870d; background-color: #fadb5e; padding: 15px; border-radius: 10px; text-align: center;">Thank you for your order!</h1>
    <h3 style="font-size: 20px; color: #333333; text-align: center;">Here are the items you ordered:</h3>
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; ">
      <thead>
        <tr style="background-color: #d9eacb;">
          <th style="padding: 10px; border: 1px solid #ccc;">Item Name</th>
          <th style="padding: 10px; border: 1px solid #ccc;">Quantity</th>
          <th style="padding: 10px; border: 1px solid #ccc;">Price</th>
          <th style="padding: 10px; border: 1px solid #ccc;">Total</th>
        </tr>
      </thead>
      <tbody>`;

  items.forEach((item, index) => {
    const itemTotal = Number(item.quantity) * Number(item.price);
    totalAmount += itemTotal;
    const backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';

    cartHtml += `
      <tr style="background-color: ${backgroundColor};">
        <td style="padding: 10px; border: 1px solid #ccc;">${item.name}</td>
        <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ccc;">&euro;${Number(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #ccc;">&euro;${Number(itemTotal).toFixed(2)}</td>
      </tr>`;
  });

  cartHtml += `
      </tbody>
      <tfoot>
        <tr style="background-color: #fadb5e; font-weight: bold;">
          <td colspan="3" style="padding: 10px; border: 1px solid #ccc; text-align: right;">Grand Total:</td>
          <td style="padding: 10px; border: 1px solid #ccc;">&euro;${totalAmount.toFixed(2)}</td>
        </tr>
        <tr style="background-color: #d3f4ff; font-weight: bold;">
          <td colspan="3" style="padding: 10px; border: 1px solid #ccc; text-align: right;">Net Payable Amount <span style="font-weight: normal;">(after any fee or discount)</span>:</td>
          <td style="padding: 10px; border: 1px solid #ccc;">&euro;${Number(endTotalG).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>`;

  return cartHtml;
}
