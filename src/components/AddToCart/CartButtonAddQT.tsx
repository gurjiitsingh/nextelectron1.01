"use client";

import React, { useEffect, useState } from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { useCartContext } from "@/store/CartContext";
import { cartProductType } from "@/lib/types/cartDataType";

const CartButtonAdd = ({ cartProduct }: { cartProduct: cartProductType }) => {
  const [quantity, setQuantity] = useState<number>(0);
  //const [ productVariat, setProductVariant ] = useState<string>();

  const { addProductToCart, removeCartProduct, cartData } = useCartContext();

  function addToCartL() {
    addProductToCart(cartProduct);
  }
  function removeFromCartL() {
    removeCartProduct(cartProduct);
  }

  useEffect(() => {
    const cartQty = cartData.filter((item: cartProductType) => {
      return item.id === cartProduct?.id;
    });
    setQuantity(cartQty[0]?.quantity);
    //  console.log(cartQty[0]?.quantity)
  }, [cartData]);

  return (
    <>
     
        <div className="flex justify-end w-[100px] rounded-lg ">
         
            {quantity > 0 ? (
              <div className="flex justify-between rounded-lg gap-2 w-full  px-1 py-2">
              
              <div className="bg-[#F3F2F0] px-[3px] pt-[1px] pb-[3px]  rounded-lg">
                  <button
                  onClick={removeFromCartL}
                  className="px-2 py-2 rounded-lg bg-white leading-none flex items-center justify-center"
                >
                  {/* flex items-center justify-center w-7 h-7 rounded-full bg-slate-400 */}
                  <IoMdRemove size={16} className="text-[#373535]" />
                </button>
                </div>
                {quantity > 0 ? (
                  <div className="flex items-center  text-gray-600">{quantity}</div>
                ) : (
                  <>0</>
                )}
                  <div className="bg-[#F3F2F0] px-[2px] pt-[1px] pb-[2px]  rounded-lg">
                    {quantity<cartProduct.currentStock! ? <>
                      
                     <button
                  onClick={addToCartL}
                  className="px-2 py-2 rounded-lg bg-white  flex items-center justify-center"
                >
                  <IoMdAdd size={16} className="text-[#373535]" />
                </button>  
                      
                      </> :<>
                       <button
                 onClick={()=>{ alert("Only " + cartProduct.currentStock + " items available");
  return;}}
                  className="px-2 py-2 rounded-lg bg-white  flex items-center justify-center"
                >
                  {/* <IoMdAdd size={16} className="text-white" /> */} +
                </button>
                      
                      
                      </>}
               
                </div>
              </div>
            ) : (<>
               {cartProduct.currentStock! >0 ? <>
               <div className="bg-[#F3F2F0] px-[3px] pt-[1px] pb-[3px]  rounded-lg">
          
              <button
                onClick={addToCartL}
                className=" w-[70px] px-1 py-1 rounded-lg bg-white font-bold text-gray-400  flex items-center justify-center"
              >
                Add
              </button>
              </div>
              </>:<></>}</>
            )}
         

          <div></div>
        </div>
     
    </>
  );
};

export default CartButtonAdd;
