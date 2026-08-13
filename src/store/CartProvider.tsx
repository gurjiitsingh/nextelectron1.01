'use client';

import React, { useEffect, useState } from 'react';
import CartContext from './CartContext';
import { posApi } from '@/lib/pos/clientApi';


import { addressT } from '@/lib/types/addressType';
import { cartProductType } from '@/lib/types/cartDataType';

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

interface Props {
  children: React.ReactNode;
}

export const CartProvider: React.FC<Props> = ({ children }) => {
  const [cartData, setCartData] = useState<cartProductType[]>([]);

  const [orderType, setOrderType] =
    useState<OrderType>('DINE_IN');

  const [address, setAddress] = useState<addressT>({
    name: '',
    mobNo: '',
    city: '',
    state: '',
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
    userId: '',
  });

  const [counter, setCounter] = useState(0);

  const [endTotalG, setEndTotalL] = useState(0);

  const [productTotalCost, setProductTotalCost] =
    useState(0);

  const [totalDiscountG, setTotalDiscountL] =
    useState(0);

  const [scheduledAt, setScheduledAt] = useState<
    string | null
  >(null);

  const [tableNo, setTableNo] = useState<string | null>(
    'T1'
  );

  // =====================================================
  // LOAD CART FROM SQLITE
  // =====================================================

useEffect(() => {
  reloadCart();
}, [tableNo]);

      // =====================================================
    // RELOAD CART FROM SQLITE
    // Location: src/store/CartProvider.tsx
    // =====================================================
    async function reloadCart() {
      const rows = await posApi.getCartItems(
        tableNo || 'T1'
      );

      setCartData(rows as cartProductType[]);
    }

  // =====================================================
  // CALCULATE TOTALS
  // =====================================================

  useEffect(() => {
    cartTotal();
  }, [cartData]);

  function cartTotal() {
    let total = 0;

    cartData.forEach((item, idx) => {
      const quantity = Number(item.quantity);
      const basePrice = Number(item.basePrice);

      if (isNaN(quantity) || isNaN(basePrice)) {
        console.warn(
          `Skipping bad cart item at index \${idx}`,
          item
        );

        return;
      }

      total += quantity * basePrice;
    });

    setProductTotalCost(
      parseFloat(total.toFixed(2))
    );
  }

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  async function addProductToCart(
    newProduct: cartProductType
  ) {
    if (
      isNaN(Number(newProduct.quantity)) ||
      isNaN(Number(newProduct.basePrice))
    ) {
      console.warn(
        'Invalid product data, skipping:',
        newProduct
      );

      return;
    }

    await posApi.addCartItem(
      {
        id: newProduct.id ?? 0,

        productId: newProduct.productId,
        productMode: newProduct.productMode,

        currentStock: newProduct.currentStock ?? 0,

        name: newProduct.name,

        categoryId: newProduct.categoryId,
        categoryName: newProduct.categoryName,

        parentId: newProduct.parentId ?? null,

        isVariant: newProduct.isVariant ?? false,

        basePrice: Number(newProduct.basePrice),
        finalPrice: Number(newProduct.finalPrice),
        modifierTotal: Number(newProduct.modifierTotal ?? 0),

        quantity: 1, // always increase by 1

        taxRate: Number(newProduct.taxRate ?? 0),
        taxType: newProduct.taxType ?? 'exclusive',

        sessionId: newProduct.sessionId ?? 'DEFAULT',

        tableId: newProduct.tableId ?? tableNo ?? 'T1',
        tableName:
          newProduct.tableName ??
          tableNo ??
          'T1',

        createdById:
          newProduct.createdById ?? '',
        createdByName:
          newProduct.createdByName ?? '',

        note: newProduct.note ?? '',

        modifiersJson:
          newProduct.modifiersJson ??
          JSON.stringify(
            newProduct.modifiers ?? []
          ),

        sentToKitchen:
          newProduct.sentToKitchen ?? false,

        kitchenPrintReq:
          newProduct.kitchenPrintReq ?? false,

        printStatus:
          newProduct.printStatus ?? 'PENDING',

        createdAt:
          newProduct.createdAt ?? Date.now(),
      },
      newProduct.tableId ?? tableNo ?? 'T1'
    );

   await reloadCart();

  }

  // =====================================================
  // DECREASE QUANTITY BY 1
  // =====================================================

  async function decCartProduct(
    item: cartProductType
  ) {
    await posApi.removeCartItem(
      String(item.id), // SQLite row id
      tableNo || 'T1',
      false // decrease by 1
    );

   await reloadCart();

    
  }

  // =====================================================
  // REMOVE ALL OF A PRODUCT LINE
  // =====================================================

  async function decCartProductAll(
    item: cartProductType
  ) {
    if (!item.uniqueKey) return;

    await posApi.removeCartItem(
      item.uniqueKey,
      tableNo || 'T1',
      true
    );

await reloadCart();
  }

  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  async function removeCartProduct(
    item: cartProductType | undefined
  ) {
    if (!item?.uniqueKey) return;

    await posApi.removeCartItem(
      item.uniqueKey,
      tableNo || 'T1'
    );

   await reloadCart();
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  async function emptyCart() {
    await posApi.clearCart(tableNo || 'T1');

     await reloadCart();
  }

  // =====================================================
  // ADD PRODUCT (LEGACY HELPER)
  // =====================================================

  async function addProduct(
    newProduct: cartProductType
  ) {
    await addProductToCart({
      ...newProduct,
      quantity: 1,
    });
  }

  // =====================================================
  // ADDRESS
  // =====================================================

  function addAddress(address: addressT) {
    setAddress(address);
  }

  // =====================================================
  // TOTALS
  // =====================================================

  function setEndTotalG(t: number) {
    setEndTotalL(t);
  }

  function setTotalDiscountG(d: number) {
    setTotalDiscountL(d);
  }

  return (
<CartContext.Provider
  value={{
    cartData,
    setCartData, // 👈 ADD THIS LINE
    address,
    addProduct,
    addAddress,
    endTotalG,
    setEndTotalG,
    counter,
    productTotalCost,
    reloadCart,
    addProductToCart,
    decCartProduct,
    decCartProductAll,
    removeCartProduct,
    emptyCart,
    totalDiscountG,
    setTotalDiscountG,
    orderType,
    setOrderType,
    tableNo,
    setTableNo,
    scheduledAt,
    setScheduledAt,
  }}
>
      {children}
    </CartContext.Provider>
  );
};