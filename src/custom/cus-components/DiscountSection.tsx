"use client";

import Image from "next/image";
import { Lato } from "next/font/google";
import { Percent } from "lucide-react";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export default function DiscountSection() {
  return (
    <section className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden  my-5 px-2 md:px-4 py-2">
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
        {/* Shoprabatt Card */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-[#a94440]">
            {/* bg-[#d24a0f] */}
        <div className="flex flex-col m-2 md:flex-row bg-[#7a1512] text-white rounded-2xl overflow-hidden   p-0">
          {/* Image (1/4 on desktop, full width on mobile) */}
          <div className="w-full md:w-1/4 h-[140px] md:h-auto relative flex-shrink-0">
            <Image
              src="/images/catering-1.jpg" // <-- replace with your image
              alt="Shoprabatt"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content (3/4 on desktop) */}
          <div className="w-full md:w-3/4 p-4 md:p-5 flex flex-col justify-between relative">
            {/* subtle pattern behind */}
            <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none"></div>

            <div className="relative z-10">
              <h2
                className={`${lato.className} text-[28px] sm:text-[32px] md:text-[36px] font-extrabold leading-none`}
              >
                10<span className="align-super text-[16px] sm:text-[18px]">%</span>
              </h2>

              <h3 className={`${lato.className} text-lg md:text-xl font-bold mt-1`}>
                Shoprabatt
              </h3>

              <p className="text-sm md:text-[13px] mt-2 leading-snug opacity-90">
                10% Rabatt – auf ausgewählte Gerichte. Das Angebot ist nicht mit anderen Rabatten kombinierbar.
              </p>
            </div>

            <div className="relative z-10 mt-3">
              <button className="bg-white text-[#7a1512] font-semibold rounded-full px-5 py-1.5 text-sm hover:bg-gray-100 transition">
                Zur Aktion
              </button>
            </div>
          </div>
        </div>
          </div>

        {/* Gruppenfunktion Card */}
      
        {/* <div className="flex flex-col md:flex-row bg-[#7a1512] text-white rounded-2xl overflow-hidden shadow-md ">
        
          <div className="w-full md:w-1/4 h-[140px] md:h-auto relative flex-shrink-0">
            <Image
              src="/images/catering-1.jpg" 
              alt="Gruppenfunktion"
              fill
              className="object-cover"
              priority
            />
          </div>

         
          <div className="w-full md:w-3/4 p-4 md:p-5 flex flex-col justify-between relative">
            <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <Percent size={36} className="text-white opacity-90" />
                <h2 className={`${lato.className} text-[24px] sm:text-[30px] md:text-[34px] font-extrabold leading-none`}>
                  +5<span className="align-super text-[14px] sm:text-[16px]">%</span>
                </h2>
              </div>

              <h3 className={`${lato.className} text-base md:text-lg font-bold mt-1`}>
                Extra Rabatt mit Gruppenfunktion
              </h3>

              <p className="text-sm md:text-[13px] mt-2 leading-snug opacity-90">
                5% Rabatt – ab 100€ Bestellwert. Das Angebot ist nicht mit anderen Rabatten kombinierbar.
              </p>
            </div>

            <div className="relative z-10 mt-3">
              <button className="bg-white text-[#7a1512] font-semibold rounded-full px-5 py-1.5 text-sm hover:bg-gray-100 transition">
                Gruppe starten
              </button>
              <p className="text-[11px] mt-2 text-[#fff5f5] opacity-90">
                Schneller & einfacher bestellen schon ab 2 Personen
              </p>
            </div>
          </div>
        </div> */}
      
      {/* </div> */}
    </section>
  );
}
