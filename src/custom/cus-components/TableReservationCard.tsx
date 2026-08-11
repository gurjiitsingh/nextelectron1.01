"use client";

import { Chicle } from "next/font/google";

import Image from "next/image";
import { FaToiletsPortable } from "react-icons/fa6";
import { PiPicnicTableBold } from "react-icons/pi";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function TableReservationCard() {
  return (
    <section className="w-full mx-auto my-8 bg-white rounded-2xl shadow-md p-4 md:p-8 border-1 border-[#7a1512]">
      <div className="flex flex-col  gap-6">
        {/* Left Side - Icon and Title */}
        <div className="flex items-center justify-start gap-4">
          <PiPicnicTableBold className="text-[#d24a0f] text-4xl md:text-5xl" />
          <h2
           
             className={`${chicle.className} text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2B2E4A]`}
          >
            Tischreservierung
          </h2>
        </div>

        {/* Right Side - Text Content */}
        <div className="flex-1 flex flex-col justify-center items-start">
          <p className="text-sm md:text-base text-gray-600 opacity-80 mb-4">
            Jetzt einen Tisch reservieren, um im Restaurant zu essen.
          </p>

          

        <button
  className="bg-[#f4e1d2] text-[#7a1512] font-semibold px-6 py-3 rounded-xl hover:bg-[#611616] transition"
  onClick={() => {
    window.location.href = "https://www.google.com/maps/reserve/v/dine/c/6JTgdCnqFvM?source=pa&opi=89978449&hl=en-IN&gei=tyL_aJLxDNCL4-EP4_HqqQQ&sourceurl=https://www.google.com/search?q%3Dmasala%2Btaste%2Bof%2Bindia%2Bbraunschweig%26rlz%3D1C1UEAD_enIN1131IN1131%26oq%3Dmasala%2Btaste%2Bof%2Bindia%2B%26gs_lcrp%3DEgZjaHJvbWUqBwgBEAAYgAQyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIGCAMQRRg9MgYIBBBFGDwyBggFEEUYPTIGCAYQRRhBMgYIBxBFGEHSAQg5NzUwajFqN6gCCLACAfEF8AkcktHNSkY%26sourceid%3Dchrome%26ie%3DUTF-8"
  }}
>
  Tischreservierung
</button>

        </div>
      </div>
    </section>
  );
}
