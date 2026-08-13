"use client";
// import { fetchProductByBaseProductId } from "@/app/(universal)/action/productsaddon/dbOperation";
// import { AddOnProductSchemaType } from "@/lib/types/productAddOnType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import React, { useEffect, useState } from "react";

import { cartProductType } from "@/lib/types/cartDataType";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";

import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { Cinzel, Lato, Roboto, Abel, Chicle } from "next/font/google";
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const abel = Abel({ subsets: ["latin"], weight: "400" });

import { FaLeaf } from "react-icons/fa";


const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

const fonts = {
  Cinzel: cinzel,
  Abel: abel,
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

const fontDescription =
  fonts[process.env.NEXT_PUBLIC_FONT_DESCRIPTION as keyof typeof fonts] || lato;

export default function ProdcutCardHorizontical19({
  product,
  allAddOns,
}: {
  product: ProductType;
  allAddOns: addOnType[];
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWithout, setSelectedWithout] = useState<string[]>([]);

  const withoutOptions = ["Fried Onions", "Tomatoes", "Raita", "Ginger"];

  const toggleOption = (item: string) => {
    setSelectedWithout((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
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

  //const priceRegular = product.price?.toString().replace (/\./g, ",") ?? "0,00";
   const priceRegular = formatCurrencyNumber(
   product.price ?? 0,       // numeric value
     (settings.currency ) as string,
       (settings.locale ) as string
 );
 
   let priceDiscounted;
   let priceTarget = product.price ?? 0;
   if (product.discountPrice && product.discountPrice > 0) {
     priceTarget = product.discountPrice;
     // priceDiscounted = product.discountPrice.toString().replace (/\./g, ",");
     priceDiscounted = formatCurrencyNumber(
       product.discountPrice,
       (settings.currency ) as string,
       (settings.locale ) as string
     );
   }

 

  // const cartProduct: cartProductType = {
  //   id: product.id,
  //   quantity: 1,
  //   price: priceTarget,
  //   name: product.name,
  //   image: product.image,
  //   categoryId: product.categoryId,
  //   productCat: product.productCat!,
  // };

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
    <div className="w-full lg:w-[49%] flex flex-col  shadow-sm  bg-white rounded-xl ">
    <div className="flex flex-col    items-center p-1">
     sfsfadsfsaffasfsa <div className="rounded-full flex items-center justify-start  w-[120px] h-[120px]  md:w-[150px]  md:h-[150px]  overflow-hidden">
        {product.image && (
          <img src={product.image} alt={product.name} className="h-full  " />
        )}
      </div>

      <div className="w-full flex flex-col pl-3 justify-between">
        <div className="w-full flex-col gap-4 justify-center ">
          <div className="w-full flex gap-1 mb-2 justify-center">
            <div className={`${chicle.className} flex text-[#bd8a15] font-bold text-5xl items-start justify-center  min-w-[180px] `}>
              {/* product-card-add-title-cover-1 */}
              {/* {productCategoryIdG !== "" && <>{product.sortOrder}.&nbsp;</>} */}
              {product.name}
            </div>
          </div>

          {/* Description */}
          {product.productDesc && (
            <p
              onClick={() =>
                alert(product.productDesc ?? "No description available")
              }
              className={`${fontDescription.className} text-center text-md text-gray-500 mt-1 line-clamp-3 cursor-pointer`}
            >
              {product.productDesc}
            </p>
          )}

          {/* <button onClick={() => alert(product.productDesc)}> */}

          {/* <button
            onClick={() =>
              alert(product.productDesc ?? "Keine Beschreibung verfügbar")
            }
            className="text-sm text-slate-500 font-extralight text-left   overflow-hidden"
          >
            {product.productDesc}
          </button> */}

          {!product.flavors && (
            <div className=" flex  items-center  justify-between py-2   rounded-3xl">
              {/* common code start */}
              {product.discountPrice !== undefined &&
              product.discountPrice > 0 ? (
                <div className="flex justify-between gap-3 items-center">
                  {" "}
                  <div className="text-md font-bold text-slate-500">
                    {priceDiscounted}
                  </div>
                  <div className="line-through text-sm text-slate-400">
                    {priceRegular}
                  </div>{" "}
                </div>
              ) : (
                <div className="text-md font-bold text-slate-500">
                  {priceRegular}
                </div>
              )}
              {/* Cart Button */}
              <div className="w-full flex justify-center mx-3 ">
                {/* {!isCartDisabled ? (
            <CartButtonAdd cartProduct={cartProduct} />
          ) : (
            <div className="relative group">
            
            </div>
          )} */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>


-
   <div
  className="flex flex-col gap-2 mt-4 p-2 rounded-b-md bg-cover bg-center bg-no-repeat p-1"
  // style={{
  //   backgroundImage: "url('/bg-biryani.jpg')",
  // }}
>
  {/* Overlay for readability */}
  <div className="rounded-xl p-3 bg-white/90">
      {withoutOptions.map((item) => (
        <label
          key={item}
          className="flex items-center border-b border-amber-100 last:border-none gap-2 text-sm text-[#bd8a15] cursor-pointer py-2 font-semibold"
        >
          <FaLeaf className="w-6 h-6 font-bold text-[#73aa28]" />
          {item}
          
        </label>
      ))}
    </div>
</div>

    </div>
  );
}

//bg-[#FF8989]
//bg-amber-400
