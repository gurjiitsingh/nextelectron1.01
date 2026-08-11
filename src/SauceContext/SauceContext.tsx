
import { ProductType } from "@/lib/types/productType";
import  { createContext, useContext } from "react";
//import { ProductType } from  '@/lib/types/ProductType'
//import { ProductTypeT } from "@/lib/types/ProductTypeype";
//import { ProductType } from "@/lib/types/ProductTypeype";
interface CartContextType {
  counter: number;
  sauceTotalCost: number;
  cartData: ProductType[] ;
  address:{} ;
  addAddress:{};
  //getAddress:()=>{};
  addsauce: ProductType | {};
  addsauceToCart:(c:ProductType)=>void
  decCartsauce:(c:ProductType)=>void
  decCartsauceAll:(c:ProductType)=>void
   removeCartsauce:(c:ProductType)=>void
   emptyCart:()=>void
}

//const CartContext = createContext<CartContextType | null>(null);

const CartContext = createContext<CartContextType>({ 
  counter: 0,
  sauceTotalCost:0,
  cartData: [],
  address: {},
  addAddress:()=>{},
 // getAddress:()=>{},
  addsauce:()=>{},
  addsauceToCart:()=>{},
  decCartsauce:()=>{},
  decCartsauceAll:()=>{},
  removeCartsauce:()=>{},
  emptyCart:()=>{}
  
  });

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartContextProvider");
  }
  return context;
};


export default CartContext


