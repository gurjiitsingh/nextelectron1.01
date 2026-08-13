"use client";

import { Chicle, Lato } from "next/font/google";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chicle",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

export default function WelcomeBanner() {
  return (
    <section className="text-center py-10 bg-white px-10 md:px-4">
      <h2
        className={`${chicle.className} text-[#f4c18f] text-[37px]  leading-9  md:text-3xl uppercase tracking-wide font-bold`}
      >
        Willkommen im offiziellen Shop von
      </h2>

      <h1
        className={`${chicle.className}  text-[#D28424] text-[39px] leading-9 md:text-5xl font-extrabold mt-1   `}
      >
        Masala   Taste of India,
       
      </h1>

      <h3
        className={`${chicle.className} text-[#D28424] text-[30px] md:text-3xl mt-0 font-bold leading-7`}
      >
        Nur hier mit 5% Online-Rabatt* bestellen
      </h3>

      <p
        className={`${lato.className} text-sm text-[#D28424] opacity-90 mt-4 max-w-2xl mx-auto`}
      >
        *Auf ausgewählte Gerichte. **Erreicht gemeinsam 100,00 € für 5 % Extra-Rabatt!
      </p>
    </section>
  );
}
