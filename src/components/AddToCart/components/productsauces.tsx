"use client";



import { ProductType } from "@/lib/types/productType";
// import { useCartContext } from "@/store/CartContext";
//import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Productvariant({
  product,
  //addSauce,
}: {
  product: ProductType;
 // addSauce: ({state,name,price,id,productDesc}:{state:boolean,name:string,price:string,id:string,productDesc:string}) => void;
}) {
 
 const [sauceProductList, setSauceProductList] = useState<ProductType[]>([]);
  
  // function addSauce(sauces){
  //   console.log("----------souce data to add----", sauces.state);
  //   if(sauces.state){
  //     console.log("----------inside");
  //     const cartProduct = {
  //           id: sauces.id,
  //           baseProductId:sauces.id,
  //           productDesc: "",
  //           productCat: "",
  //           image: "/com.jpg",
  //           isFeatured: false,
  //           name: sauces.name,
  //           price: sauces.price,
  //           purchaseSession: "",
  //           quantity: 1,
  //           status: "",
  //         } as ProductType;
  //        console.log("final cart product ----------", cartProduct)

  //        setSauceProductList((st)=>[...st,cartProduct])
  //       //  addProductToCart(cartProduct);

  //   }
    
  // }
  useEffect(()=>{},[sauceProductList])

  console.log("----------",sauceProductList )
  return (
   
      <div className="w-full  bg-white flex flex-row border-b ">
        <div className="w-full flex flex-col p-3 justify-between">
          <div className="w-full flex justify-between gap-2 ">
            <div className="flex gap-4 justify-start">
            <div>
              <input
                type="checkbox"
                name="extra"
             
                
                onChange={(e) => {
               //   addSauce({state:e.target.checked,name:product.name,price:product.price, id:product.id,productDesc:product.productDesc});
                }}
              />
            </div>
            <div className="font-thin">{product.name}</div>
            </div>
            <div className="font-thin">&euro;{product.price}</div>
          </div>
        </div>
      </div>
   
  );
}
