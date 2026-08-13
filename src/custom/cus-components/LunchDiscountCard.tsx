"use client";

import { Chicle, Ultra, Lato } from "next/font/google";


const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export default function LunchDiscountCard() {
  return (
    <section className="w-full mx-auto my-8 bg-[#fdf4ec] rounded-xl shadow-md p-4 md:p-8">
      <div className="flex flex-col">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-8">
        {/* Left Side - Title and Time Information */}
        <div className="flex-1">
          <h2
            className={`${chicle.className} text-3xl md:text-3xl font-extrabold text-[#2B2E4A]`}
          >
            MITTAGS SPEISEKARTE
          </h2>
          <p className="text-[#d24a0f] text-sm mt-2">
            Von 11:30 Uhr bis 14:30 Uhr (Mo-Fr außer an Feiertagen); 
            {/* vegetarische Speisen können vegan serviert werden */}
          </p>
        </div>

        {/* Right Side - Additional Information */}
        <div className="flex-1 flex justify-start items-center mt-4 md:mt-0">
          <p className="text-sm text-[#FF7043]">
            {/* Wieder verfügbar ab Donnerstag 11:30 Uhr */}
          </p>
        </div>
      </div>

      {/* Product Information Button */}
      <div className="mt-6 text-center md:text-left w-[30%]">
        <button className="bg-[#7a1512] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#d24a0f] hover:text-white transition">
          Produktinformationen
        </button>
      </div>
      </div>
    </section>
  );
}
