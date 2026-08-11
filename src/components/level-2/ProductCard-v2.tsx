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
import CartButton from "../AddToCart/CartButton";
import AddOn from "../level-1/AddOn";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import Image from "next/image";

import { Cinzel, Lato, Roboto  } from "next/font/google";
// import { Montserrat, Oswald, Bebas_Neue, Anton, Poppins } from "next/font/google";
// import { Great_Vibes, Pacifico, Dancing_Script } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
//const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// export const vibes = Great_Vibes({ subsets: ["latin"], weight: ["400"] });
// export const pacifico = Pacifico({ subsets: ["latin"], weight: ["400"] });
// export const dancing = Dancing_Script({ subsets: ["latin"], weight: ["400", "700"] });

// export const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700", "900"] });
// export const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
// export const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
// export const anton = Anton({ subsets: ["latin"], weight: ["400"] });

//const fonts = { Cinzel: cinzel, Lato: lato, Roboto: roboto, Poppins: poppins };
 const fonts = {
  Cinzel: cinzel,
  // Playfair: playfair,
  // Cormorant: cormorant,
  // Lora: lora,
  // Montserrat: montserrat,
  // Oswald: oswald,
  // Bebas: bebas,
  // Anton: anton,
  // GreatVibes: vibes,
  // Pacifico: pacifico,
  // Dancing: dancing,
  Lato: lato,
  Roboto: roboto,
  //Poppins: poppins,
};

const fontTitle =
  fonts[process.env.NEXT_PUBLIC_FONT_TITLE as keyof typeof fonts] || cinzel;
const fontDescription =
  fonts[process.env.NEXT_PUBLIC_FONT_DESCRIPTION as keyof typeof fonts] || lato;
const fontPrice =
  fonts[process.env.NEXT_PUBLIC_FONT_PRICE as keyof typeof fonts] || roboto;


export default function ProdcutCardHorizontical({
  product,
  allAddOns,
}: {
  product: ProductType;
  allAddOns: addOnType[];
}) {
  const [addOnData, setAddOnData] = useState<addOnType[]>([]);
  const { productCategoryIdG, settings } = UseSiteContext();

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
  const priceRegular = formatCurrencyNumber(
    product.price ?? 0,
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
    price: priceTarget,
      currentStock: null,
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

  return (
    <div
      className="
        bg-white border border-gray-200 rounded-xl shadow hover:shadow-md
        transition-all duration-200 flex flex-col overflow-hidden
        w-full sm:w-full md:w-[280px] lg:w-[300px]
      "
    >
      {/* Product Image */}
      <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="flex-1">
          {/* Title */}
           <h3 className={`${fontTitle.className} text-lg font-semibold text-gray-900 leading-snug line-clamp-2`}>
            {productCategoryIdG && <>{product.sortOrder}.&nbsp;</>}
            {product.name}
          </h3>

          {/* Description */}
          {product.productDesc && (
            <p
              onClick={() =>
                alert(product.productDesc ?? "No description available")
              }
               className={`${fontDescription.className} text-sm text-gray-600 mt-1 line-clamp-3 cursor-pointer`}
            >
              {product.productDesc}
            </p>
          )}
        </div>

        {/* Price + AddToCart */}
        {!product.flavors && (
          <div className="flex items-center justify-between mt-4">
            {/* Price Section */}
            {priceDiscounted ? (
               <div className={`${fontPrice.className} text-sm font-semibold text-gray-800`}>
                <span className="line-through text-gray-400 mr-2">
                  {priceRegular}
                </span>
                <span className="text-green-600">{priceDiscounted}</span>
              </div>
            ) : (
               <div className={`${fontPrice.className} text-sm font-semibold text-gray-800`}>
                {priceRegular}
              </div>
            )}

            {/* Cart Button */}
            {!isCartDisabled ? (
              <CartButton cartProduct={cartProduct} />
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
        )}

        {/* AddOns */}
        {product.flavors && addOnData.length > 0 && (
          <div className="mt-4">
            <AddOn baseProductName={product.name} addOnData={addOnData} />
          </div>
        )}
      </div>
    </div>
  );
}
