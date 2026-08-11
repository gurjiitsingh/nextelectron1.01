"use client";

import React, { useEffect, useState } from "react";
import { fetchProductAddOnByBaseProductId } from "@/app/(universal)/action/productsaddon/dbOperation";
import { ProductType } from "@/lib/types/productType";
import { fetchProductSauces } from "@/app/(universal)/action/productsauces/dbOperation";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { IoClose } from "react-icons/io5";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { fetchflavorsProductG } from "@/app/(universal)/action/flavorsProductG/dbOperation";
import { flavorsProductGType } from "@/lib/types/flavorsProductGType";
import { sauceProductType } from "@/lib/types/productSaucesType";
import { AddOnProductSchemaType } from "@/lib/types/productAddOnType";
import { fetchProductById } from "@/app/(universal)/action/products/dbOperation";

type TVariantType = { name: string; price: number };

const ChooseProduct = () => {
  const [productAddOn, setProductAddon] = useState<AddOnProductSchemaType[]>([]);
  const [productBase, setProductBase] = useState<ProductType | null>(null);
  const [cartItem, setCartItem] = useState<ProductType | null>(null);
  const [productSauces, setProductSaces] = useState<sauceProductType[]>([]);
  const [flavorsProductG, setFlavorsProductG] = useState<flavorsProductGType[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [VariantType, setVariantType] = useState<TVariantType>({ name: "", price: 0 });
  const [quantity, setQuantity] = useState(1);

  const { setShowProductDetailM, baseProductId } = UseSiteContext();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const baseProduct = await fetchProductById(baseProductId);
        setProductBase(baseProduct);
        setCartItem(baseProduct);

        const productAddon = await fetchProductAddOnByBaseProductId(baseProductId);
        setProductAddon(productAddon);

        const sauces = await fetchProductSauces();
        setProductSaces(sauces);

        if (!baseProduct?.flavors) {
          const flavorsProductG = await fetchflavorsProductG();
          setFlavorsProductG(flavorsProductG);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
    fetchProduct();
  }, [baseProductId]);

  function itemOrderUpdate() {
    if (!productBase || !VariantType.name) return;

    const finalPrice = parseFloat((productBase.price + VariantType.price).toFixed(2));
    const cartId = `${baseProductId}-${VariantType.name}`;

    const cartProduct = {
      id: cartId,
      baseProductId,
      productDesc: VariantType.name,
      productCat: productBase.productCat,
      image: productBase.image,
      isFeatured: productBase.isFeatured,
      name: productBase.name,
      price: finalPrice,
      purchaseSession: "",
      quantity,
      status: "",
    };

    // Example placeholder: addProductToCart(cartProduct);

    setVariantType({ name: "", price: 0 });
    setQuantity(1);
  }

  const price = productBase?.price?.toString().replace(/\./g, ",") ?? "";

  function addToCartL() {
    if (VariantType.name) {
      setShowProductDetailM(false);
      setShowMessage(false);
      itemOrderUpdate();
    } else {
      setShowMessage(true);
    }
  }

  return (
    <div className="w-screen h-screen backdrop-blur-xs overflow-hidden absolute mt-10 z-50">
      <div className="container w-full md:max-w-[400px] bg-slate-200 rounded-2xl mx-auto flex flex-col py-5 px-2">
        <div className="flex justify-end w-full">
          <button
            className="px-2 py-1 bg-slate-200 rounded-md"
            onClick={() => {
              setShowProductDetailM(false);
              setVariantType({ name: "", price: 0 });
              setQuantity(1);
            }}
          >
            <IoClose />
          </button>
        </div>

        <div className="w-full bg-white flex flex-row border rounded-t-2xl">
          <div className="rounded-tl-2xl">
            <img src={productBase?.image} className="w-[150px] rounded-tl-2xl" alt={productBase?.name} />
          </div>

          <div className="w-full flex flex-col p-3 justify-between">
            <div className="w-full flex gap-2 justify-between">
              <div>{productBase?.name}</div>
              <div>&euro;{price}</div>
            </div>
          </div>
        </div>

        {showMessage && (
          <div className="z-50 text-red-500 w-full text-sm bg-slate-100 rounded-lg p-3">
            Wähle dein Flavour
          </div>
        )}

        {/* Add variant & sauces rendering components here */}

        <div className="w-full bg-white flex flex-row border rounded-b-2xl">
          <div className="flex items-center p-1 justify-center rounded-lg gap-2">
            <button
              onClick={() => quantity > 1 && setQuantity(q => q - 1)}
              className={`border px-3 py-3 rounded-full ${quantity > 1 ? "bg-blue-500" : "bg-blue-300"}`}
            >
              <IoMdRemove size={20} className="text-white" />
            </button>

            {quantity}

            <button
              onClick={() =>
                VariantType.name ? setQuantity(q => q + 1) : setShowMessage(true)
              }
              className={`border px-3 py-3 rounded-full ${VariantType.name ? "bg-blue-500" : "bg-blue-300"}`}
            >
              <IoMdAdd size={20} className="text-white" />
            </button>

            <button className="px-2 py-1 bg-slate-200 rounded-md" onClick={addToCartL}>
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseProduct;
