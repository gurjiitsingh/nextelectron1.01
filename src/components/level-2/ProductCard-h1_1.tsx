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
import Image from "next/image";

// import { Bricolage_Grotesque } from "next/font/google";

// const bricolage = Bricolage_Grotesque({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"], // choose what weights you need
//   display: "swap",
// });
// ${bricolage.className}

export default function ProdcutCardHorizontical({
  product,
  allAddOns,
}: {
  product: ProductType;
  allAddOns: addOnType[];
}) {
  const [addOnData, setAddOnData] = useState<addOnType[]>([]);
  const { settings } = UseSiteContext();

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

  const priceRegular = formatCurrencyNumber(
    product.price ?? 0,
    settings.currency as string,
    settings.locale as string
  );
  let priceDiscounted;
  let priceTarget = product.price ?? 0;
  if (product.discountPrice && product.discountPrice > 0) {
    priceTarget = product.discountPrice;
    // priceDiscounted = product.discountPrice.toString().replace (/\./g, ",");
    priceDiscounted = formatCurrencyNumber(
      product.discountPrice,
      settings.currency as string,
      settings.locale as string
    );
  }

  const cartProduct: cartProductType = {
    id: product.id,
    quantity: 1,
    currentStock: product.currentStock!,
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
    <div
      key={product.id}
      className="bg-white w-full md:w-[49%] flex items-center gap-4 rounded-2xl shadow-sm hover:shadow-md transition p-3"
    >
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 ">{product.name}</h3>
        <p className="text-sm text-gray-500 ">
          {product.productDesc || "Delicious dish"}
        </p>
        <div className="mt-1 text-sm font-semibold text-[#d24a0f]">
          {product.discountPrice !== undefined && product.discountPrice > 0 ? (
            <div className="flex justify-start gap-3 items-center">
              {" "}
              <div className="text-sm font-bold text-[#2f2d2b]">
                {priceDiscounted}
              </div>
              <div className="text-sm line-through  text-[#2f2d2b]">
                {priceRegular}
              </div>{" "}
            </div>
          ) : (
            <div className="text-sm  text-[#2f2d2b]">{priceRegular}</div>
          )}
        </div>
      </div>

      {/* Add Button */}
      {!product.flavors && (
        <div className=" flex  items-center  justify-between py-px   rounded-3xl">
          {/* common code start */}

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
  );
}

//bg-[#FF8989]
//bg-amber-400
