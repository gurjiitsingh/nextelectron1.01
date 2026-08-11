import CartButton from '@/components/AddToCart/CartButton'
import { cartProductType } from '@/lib/types/cartDataType'

import { addOnType } from '@/lib/types/addOnType';
import React from 'react'

export default function InsertData({baseProductName,addOnData}:{baseProductName:string,addOnData:addOnType}) {
   const ProductName = baseProductName +" "+ addOnData.name;
const cartProduct: cartProductType = {
  id: addOnData.id as string,

  uniqueKey: `${addOnData.id}-${Date.now()}`,

  price: addOnData.price,
  basePrice: addOnData.price,

  quantity: 1,
  
currentStock: null,
  name: ProductName,
  image: addOnData.image,

  categoryId: "",
  productCat: "",

  taxRate: undefined,
  taxType: undefined,
};


  return (
    <CartButton cartProduct={cartProduct} />
  )
}

