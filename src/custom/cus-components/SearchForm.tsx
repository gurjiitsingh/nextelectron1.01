"use client";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext"; 
import React, { useEffect, useState } from "react";

export default function SearchForm() {
  const { setProductToSearchQuery } = UseSiteContext();
  const { TEXT } = useLanguage(); //  get translations
  const [query, setQuery] = useState("");

  useEffect(() => {
    setProductToSearchQuery(query);
  }, [query, setProductToSearchQuery]);

  return (
    <div className="max-w-md w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={TEXT.searchForm.placeholder || "Search dishes..."} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-2 pl-10 pr-4 rounded-xl border border-[#64870d] focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-gray-800 shadow-sm placeholder-gray-400"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
          />
        </svg>
      </div>
    </div>
  );
}
