"use client";

import { Lato } from "next/font/google";
import { Percent } from "lucide-react";
import Image from "next/image";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export default function DiscountSectionSingle() {
  return ( <section className="max-w-5xl mx-auto px-2">
    <div className="w-full  md:mx-0 my-8 bg-white rounded-2xl overflow-hidden shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Side - Image */}
        <div className="relative w-full h-[200px] md:h-[250px]">
          <Image
            src="/images/catering-1.jpg" // <-- replace with your image path
            alt="Buffet dishes"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Side - Text */}
        <div className="flex flex-col justify-center bg-[#f4f4f4] text-[#2b2b2b] px-6 py-5 md:px-8">
          <h2
            className={`${lato.className} text-xl md:text-2xl font-extrabold text-[#7a1512]`}
          >
            Masala’s Buffet & Birthday Party
          </h2>

          <p className="text-sm md:text-base mt-2 opacity-80">
            14.04.25 | 17:00
          </p>

          <p className="text-sm md:text-base opacity-80 mb-4">
            Sunny Garden Restaurant
          </p>

          <button className="bg-[#7a1512] text-white font-semibold rounded-full px-5 py-2 text-sm hover:bg-[#611616] transition w-fit">
            View Details
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
