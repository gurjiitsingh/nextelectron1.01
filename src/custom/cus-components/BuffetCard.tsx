"use client";

import { Lato, Chicle } from "next/font/google";
import Image from "next/image";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chicle",
  display: "swap",
});

export default function BuffetCard() {
  return (
    <section
      id="bf"
      className="max-w-5xl mx-auto px-2 md:px-0 my-8 pt-[50px] scroll-mt-[50px]"
    >
      <div className="bg-[#fff2e9] rounded-2xl overflow-hidden shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-[0.6fr_1.4fr]">
          {/* Left Side - Image */}
          <div className="relative w-full h-[180px] md:h-[300px]">
            <Image
              src="/images/catering-1.jpg" // <-- replace with your image path
              alt="Buffet dishes"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Side - Text */}
          <div className="flex flex-col justify-center bg-[#fff2e9] text-[#2b2b2b] px-5 py-5 md:px-8">
            <h2
              className={`${chicle.className} text-[22px] sm:text-[26px] md:text-[28px] font-bold text-[#7a1512]`}
            >
              
            </h2>

            {/* Two-column content */}
            <div
              className={`${lato.className} grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] sm:text-[14px] md:text-[15px] mt-1 leading-snug`}
            >
              <p></p>
              <p></p>

              <p className="font-semibold text-[#7a1512]"></p>
              <p></p>

              <p></p>
              <p></p>

              <p></p>
              <p>Carrer del Segle XX, 9, Horta-Guinardó, 08041 Barcelona, Spain</p>

              <p></p>
              <p></p>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
}
