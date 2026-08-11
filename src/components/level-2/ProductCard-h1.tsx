"use client";
// import { fetchProductByBaseProductId } from "@/app/(universal)/action/productsaddon/dbOperation";
// import { AddOnProductSchemaType } from "@/lib/types/productAddOnType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import React, { useEffect, useState } from "react";

import { cartProductType } from "@/lib/types/cartDataType";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { IoMdAdd } from "react-icons/io";
import toast from "react-hot-toast";
import AddOn from "../level-1/AddOn";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import CartButtonAdd from "../AddToCart/CartButtonAdd";


export default function ProdcutCardHorizontical({
  product,
  allAddOns,
}: {
  product: ProductType;
  allAddOns: addOnType[];
}) {
  const [addOnData, setAddOnData] = useState<addOnType[]>([]);
  const {  settings } = UseSiteContext();
 
  useEffect(() => {
    if (allAddOns.length !== 0 && product.flavors) {
      const AddOnData = allAddOns.filter(
        (item: addOnType) => product.id === item.baseProductId
      );
      AddOnData.sort(
        (a: addOnType, b: addOnType) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
      setAddOnData(AddOnData);
    }
  }, [product.id, allAddOns, product.flavors]);

  //common code start

  //const priceRegular = product.price?.toString().replace (/\./g, ",") ?? "0,00";
  // const priceRegular = formatCurrencyNumber(
  //   product.price ?? 0,
  //   (settings.currency || "EUR") as string,
  //   (settings.locale || "de-DE") as string
  // );

  const priceRegular = formatCurrencyNumber(
  product.price ?? 0,       // numeric value
  (settings.currency) as string,
      (settings.locale) as string
);

  let priceDiscounted;
  let priceTarget = product.price ?? 0;
  if (product.discountPrice && product.discountPrice > 0) {
    priceTarget = product.discountPrice;
    // priceDiscounted = product.discountPrice.toString().replace (/\./g, ",");
    priceDiscounted = formatCurrencyNumber(
      product.discountPrice,
      (settings.currency) as string,
      (settings.locale) as string
    );
  }

  const cartProduct: cartProductType = {
    id: product.id,
    quantity: 1,
    currentStock :product.currentStock!,
    price: priceTarget,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    productCat: product.productCat!,
   taxRate: product.taxRate,
    taxType: product.taxType,
    
  };

  const isCartDisabled = (() => {
    if (product.categoryId !== "2vvuGl0pgbvvyEPc7o83") return false;
    const berlinTime = new Date().toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    });
    const berlinHour = new Date(berlinTime).getHours();
    return !(berlinHour >= 11 && berlinHour < 16);
  })();

  //common code end
  return (
    <div className="bg-white w-full  lg:w-[49%]    shadow-md flex flex-row   rounded-xl items-center p-1">
      <div className="rounded-lg border-1 border-slate-100 flex items-center justify-center w-[120px]   md:w-[150px]    overflow-hidden">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="h-full  "
          />
        )}
      </div>

      <div className="w-full flex flex-col pl-3 justify-between">
        <div className="w-full flex-col gap-4 justify-between ">
          <div className="w-full flex gap-1 mb-2 justify-between ">
            <div className="flex text-gray-600 font-sami-bold items-start justify-start  min-w-[180px] ">
           {/* product-card-add-title-cover-1 */}
              {/* {productCategoryIdG !== "" && <>{product.sortOrder}.&nbsp;</>} */}
              {product.name}
            </div>
          {product.currentStock! >0 ? <>
          <div className="text-gray-600 font-sami-bold"> {product.currentStock} in stock</div>
          </> : <>
           <div className="text-slate-500 font-sami-bold">  Out of stock</div>
          </>}  
          </div>

          {/* <button onClick={() => alert(product.productDesc)}> */}

          <button
            onClick={() =>
              alert(product.productDesc ?? "Keine Beschreibung verfügbar")
            }
            className="text-sm text-gray-500 font-extralight text-left   overflow-hidden"
          >
            {product.productDesc}
          </button>

          {!product.flavors && (
            <div className=" flex  items-center  justify-between py-[1px]   rounded-3xl">
            
              {/* common code start */}
              {product.discountPrice !== undefined &&
              product.discountPrice > 0 ? (
                <div className="flex justify-between gap-3 items-center">
                  {" "}
                  <div className="text-md font-bold text-slate-500">{priceDiscounted}</div>
                  <div className="line-through text-sm text-slate-500">{priceRegular}</div>
                  {" "}
                  </div>
              ) : (
                <div className="text-md font-bold text-slate-500">{priceRegular}</div>
              )}
               {/* Cart Button */}
        <div className="w-full flex justify-end ">
          {!isCartDisabled ? (
            <CartButtonAdd cartProduct={cartProduct} />
          ) : (
            <div className="relative group">
              <button
                onClick={() =>
                  toast(
                    "Lunch available only from 11 to 16. Please choose another item."
                  )
                }
                className="px-2 py-1 rounded-full bg-gray-400 cursor-not-allowed"
              >
                <IoMdAdd size={20} className="text-white" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[220px] bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Lunch available only from 11 to 16.
              </div>
            </div>
          )}
        </div>
            </div>
          )}
        </div>

        {product.flavors && (
          <AddOn baseProductName={product.name} addOnData={addOnData} />
        )}
      </div>
    </div>
  );
}

//bg-[#FF8989]
//bg-amber-400
