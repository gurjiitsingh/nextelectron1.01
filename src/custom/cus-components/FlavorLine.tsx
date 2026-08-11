import React from 'react';
import { Playfair_Display } from "next/font/google";
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export default function FlavorLine() {
  return (
    <section className="w-full flex flex-col gap-36 items-center justify-center py-8 px-4">
      
   {/* <h2 className="libre-baskerville-regular text-2xl md:text-6xl max-w-4xl mx-2 text-center text-slate-500">
    Authentische Rezepte, frische Zutaten und eine Prise Tradition &ndash;
          <span className="text-[#79716b]"> das ist unser Geheimnis für großartigen Geschmack.</span>
   </h2>

    <h2 className="playfair-display-400 font-playfair text-2xl md:text-6xl max-w-4xl mx-2 text-center text-slate-500">
    Authentische Rezepte, frische Zutaten und eine Prise Tradition &ndash;
          <span className="text-[#79716b]"> das ist unser Geheimnis für großartigen Geschmack.</span>
   </h2> */}

   <h2 className="playfair-display-400 font-playfair text-2xl md:text-6xl max-w-4xl mx-2 text-center text-[#2B2E4A]">
    Authentische Rezepte, frische Zutaten und eine Prise Tradition &ndash;
          <span className="text-[#d24a0f]"> das ist unser Geheimnis für großartigen Geschmack.</span>
   </h2>

   {/* <h2 className="playfair-display-400 font-playfair text-2xl md:text-6xl max-w-4xl mx-2 text-center text-[#2B2E4A]">
    Authentische Rezepte, frische Zutaten und eine Prise Tradition &ndash;
          <span className=""> das ist unser Geheimnis für großartigen Geschmack.</span>
   </h2> */}
  
  
   {/* <h2 className="playfair-display-400 font-playfair text-2xl md:text-6xl max-w-4xl mx-2 text-center text-[#d24a0f]">
    Authentische Rezepte, frische Zutaten und eine Prise Tradition &ndash;
          <span className="text-[#d24a0f]"> das ist unser Geheimnis für großartigen Geschmack.</span>
   </h2> */}
    </section>
  );
}
