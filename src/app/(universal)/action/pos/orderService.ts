import { cartProductType } from '@/lib/types/cartDataType';

export interface SaveOrderInput {
  tableNo: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  items: cartProductType[];
  customerName?: string;
  customerPhone?: string;
}

export async function saveOrder(input: SaveOrderInput) {
  const now = Date.now();

  const orderId = crypto.randomUUID();
  const orderNo = `ORD-${now}`;

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0
  );

  const orderMaster = {
    id: orderId,
    orderNo,
    tableNo: input.tableNo,
    orderType: input.orderType,
    customerName: input.customerName ?? 'Customer',
    customerPhone: input.customerPhone ?? '',
    itemTotal: subtotal,
    grandTotal: subtotal,
    paymentStatus: 'UNPAID',
    orderStatus: 'OPEN',
    createdAt: now,
  };

  const orderItems = input.items.map((item) => ({
    id: crypto.randomUUID(),
    orderId,
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    basePrice: item.basePrice,
    finalPrice: item.finalPrice,
    lineTotal: item.finalPrice * item.quantity,
    note: item.note ?? '',
    modifiersJson:
      item.modifiersJson ??
      JSON.stringify(item.modifiers ?? []),
    createdAt: now,
  }));

  // =========================================
  // SAVE TO SQLITE
  // Add these IPC handlers later:
  // order:insertMaster
  // order:insertItems
  // =========================================
  await window.posApi.insertOrderMaster(orderMaster);
  await window.posApi.insertOrderItems(orderItems);

  // =========================================
  // PRINTING PLACEHOLDER (ADD LATER)
  // Similar to Android printOrder(...)
  // await window.posApi.printBill({
  //   order: orderMaster,
  //   items: orderItems,
  // });
  // =========================================

  return {
    orderId,
    orderNo,
    orderMaster,
    orderItems,
  };
}