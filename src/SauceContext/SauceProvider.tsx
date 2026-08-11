"use client";

import React, {  useEffect, useState } from "react";
import CartContext from "./SauceContext";

//import { productT } from "@/lib/types/productT";
import { addressT } from "@/lib/types/addressType";
import {  ProductType } from "@/lib/types/productType";

interface Props {
  children: React.ReactNode;
}

export const CartProvider: React.FC<Props> = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  //var now1 = Date.now().toString();

  const [cartData, setCartData] = useState<ProductType[]>([]);
  const [address, setAddress] = useState({});
  const [counter, setCounter] = useState(0);
  const [sauceTotalCost, setsauceTotalCost] = useState(0);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {

    if (window.localStorage.getItem("cart_sauce_data_id") == null) {
      const cartItemDateId = Date.now().toString();
      window.localStorage.setItem("cart_sauce_data_id", cartItemDateId);
    }
   
    if (isUpdated) {
      window.localStorage.setItem("cart_sauce_data", JSON.stringify(cartData));
    } else {
      const cart_data_localstorage: any =
      window.localStorage.getItem("cart_sauce_data");

      const data = JSON.parse(cart_data_localstorage);
      setCartData([]);
      if (data) {
        data.map((item: ProductType) => {
          setCartData((prevState) => {
            return [...prevState, { ...item }];
          });
        });
      }
    }
    setIsUpdated(false);
    cartTotal();
    //console.log("useEffe 0", cartData)
  }, [cartData]);

  useEffect(() => {
  
    const cart_data_localstorage: any =
    window.localStorage.getItem("cart_sauce_data");

    const data = JSON.parse(cart_data_localstorage);
    setCartData([]);

    if (data) {
      data.map((item: ProductType) => {
        setCartData((prevState) => {
          return [...prevState, { ...item }];
        });
      });
    }

    setIsUpdated(false);
    cartTotal();
  }, []);

  function cartTotal() {
    let total = 0;
    if (cartData.length > 0) {
      cartData.forEach((element) => {
        total =
          total +
        // parseInt(element.quantity) * parseFloat(element.price).toFixed(2);
        element.quantity! * +element.price;
      });
    }

    setsauceTotalCost(total);
    setIsUpdated(true);
  }

  function addsauceToCart(newsauce: ProductType) {

    const isItemInCart = cartData.find(
      (cartItem) => cartItem.id === newsauce.id
    ); // check if the item is already in the cart

    if (isItemInCart) {
      setCartData(
        cartData.map(
          (
            cartItem // if the item is already in the cart, increase the quantity of the item
          ) =>
            cartItem.id === newsauce.id
              ? { ...cartItem, quantity: cartItem.quantity! + 1 }
              : cartItem // otherwise, return the cart item
        )
      );
    } else {
      if (typeof window !== 'undefined') {
      setCartData([
        ...cartData,
        {
          ...newsauce,
          quantity: 1,
        //  purchaseSession: localStorage.getItem("cart_sauce_data_id"),
          publishStatus: "draft",
        },
      ]); // if the item is not in the cart, add the item to the cart
    }
    }
    // setIsUpdated(true);
  }

  function decCartsauce(decsauce: ProductType) {
    //this funciton dec sauce almost to 1
    setCartData(
      cartData.map((item: ProductType) => {
        return item.id === decsauce.id
          ? item.quantity! > 1
            ? { ...item, quantity: item.quantity! - 1 }
            : item
          : item;
      })
    );
    setIsUpdated(true);
  }
  function decCartsauceAll(decsauce: ProductType) {
    //this funciton dec sauce almost to 0
    //removeCartsauce
    setCartData(
      cartData.map((item: ProductType) => {
        return item.id === decsauce.id
          ? item.quantity! > 0
            ? { ...item, quantity: item.quantity! - 1 }
            : item
          : item;
      })
    );
    setIsUpdated(true);
  }

  function removeCartsauce(item: ProductType) {
    const isItemInCart = cartData.find((cartItem) => cartItem.id === item.id) as ProductType ;
  //  console.log("item qu-- ", isItemInCart.quantity);
    if (isItemInCart.quantity! <= 1) {
      setCartData(cartData.filter((cartItem) => cartItem.id !== item.id)); // if the quantity of the item is 1, remove the item from the cart
    } else {
      setCartData(
        cartData.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity! - 1 } // if the quantity of the item is greater than 1, decrease the quantity of the item
            : cartItem
        )
      );
    }

    // setCartData(
    //   cartData.filter((item: ProductType) => {
    //     return item.sauceId !== remsauce.sauceId;
    //   })
    // );

    setIsUpdated(true);
  }

  function emptyCart() {
    setCartData([]);

    setIsUpdated(true);
  }
  function addsauce(newsauce:ProductType) {
    // console.log("new add sauce", newsauce)
    // const sauce = {
    //   id:"kljljl",
    //   name:"test"
    // }
    //     setCartData((prev)=>{
    //       console.log(prev, sauce)
    //       return [...prev, sauce]
    //     })

    const isItemInCart = cartData.find(
      (cartItem) => cartItem.id === newsauce.id
    ); // check if the item is already in the cart

    if (isItemInCart) {
      setCartData(
        cartData.map(
          (
            cartItem // if the item is already in the cart, increase the quantity of the item
          ) =>
            cartItem.id === newsauce.id
              ? { ...cartItem, quantity: cartItem.quantity! + 1 }
              : cartItem // otherwise, return the cart item
        )
      );
    } else {
      if (typeof window !== 'undefined') {
      setCartData([
        ...cartData,
        {
          ...newsauce,
          quantity: 1,
          purchaseSession: localStorage.getItem("cart_sauce_data_id"),
          publishStatus: "draft",
        },
      ]); // if the item is not in the cart, add the item to the cart
    }}
  }
  // const getCartTotal = () => {
  //   return cartData.reduce(
  //     (total, item) => total + (+item.price) * item.quantity,
  //     0
  //   ); // calculate the total price of the items in the cart
  // };

  function addAddress(address:addressT) {
    if (typeof window !== 'undefined') {
    localStorage.setItem("customer_address", JSON.stringify(address));
    }
  }
  // function getAddress() {
  //   const address = window.localStorage.getItem("customer_address");
  //   setAddress(JSON.parse(address));
  // }

  return (
    <CartContext.Provider
      value={{
        cartData,
        address,
        addsauce,
        addAddress,
      //  getAddress,
        counter,
        sauceTotalCost,
        addsauceToCart,
        decCartsauce,
        decCartsauceAll,
        removeCartsauce,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
