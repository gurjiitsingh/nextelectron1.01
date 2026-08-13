import React from "react";
import { Sour_Gummy } from "next/font/google";
import { useLanguage } from '@/store/LanguageContext';

const sourGummy = Sour_Gummy({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function Title() {
   const { TEXT, BRANDING } = useLanguage();
  return (
    <div className="flex gap-2 my-5">
      <div className="flex items-center">
        <img src="/logo.png" alt={TEXT.logo_alt} className="h-12 w-auto" />
      </div>
      <div>
        <h1 className={`${sourGummy.className} rounded-2xl text-5xl w-full font-bold text-brand-heading`}>
          <div>
            {BRANDING.brand}
            <span className="text-xl font-light pl-1 text-brand-subheading">{BRANDING.tag_line}</span>
          </div>
        </h1>
      </div>
    </div> 
  );
}

