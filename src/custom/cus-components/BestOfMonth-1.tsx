"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaStar,
  FaFireAlt,
  FaLeaf,
  FaHeart,
  FaSmile,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {  Chicle } from "next/font/google";

import { Cinzel, Lato, Roboto, Poppins } from "next/font/google";
import ProductCardPrductOfMonth from "../../components/level-2/ProductCardPOM";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"], 
});
const chicle = Chicle({ subsets: ["latin"], weight: "400" });

export default function BestOfMonth() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);


  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/products/featured", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch featured products");
        const products = await res.json();
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      }
    };
    fetchData();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };





  return (
    <section className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 ">
      <div className="bg-[#326645] rounded-3xl py-1 md:py-10 my-12 relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-left mb-8 sm:mb-10">
          <div
            className={`${chicle.className} text-3xl sm:text-3xl md:text-4xl font-light text-[#ea9244] uppercase flex items-center justify-start gap-2`}
          >
            <FaStar /> Trending Foods
          </div>
          <p className="text-[#d24a0f] text-xs sm:text-sm mt-2">
            The most ordered dishes of the last 30 days
          </p>
          {/* <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Fast alle Gerichte mit: <span className="font-semibold">Reis</span>
          </p> */}
        </div>

        {/* Arrows — visible on all devices */}
        <button
          onClick={() => scroll("left")}
          className="flex absolute left-2 sm:left-3 top-[45%] z-10 bg-[#DFA965] text-white p-2 sm:p-3 rounded-full hover:bg-[#d24a0f] transition"
          aria-label="Scroll Left"
        >
          <FaChevronLeft className="text-sm sm:text-base" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="flex absolute right-2 sm:right-3 top-[45%] z-10 bg-[#DFA965] text-white p-2 sm:p-3 rounded-full hover:bg-[#d24a0f] transition"
          aria-label="Scroll Right"
        >
          <FaChevronRight className="text-sm sm:text-base" />
        </button>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-0 sm:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-hide"
        >
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product,i) => (
              <ProductCardPrductOfMonth
                        key={product.id ?? `${product.name}-${i}`}
                        product={product}
                        
                      />
            ))
          ) : (
            // Skeleton loader
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="min-w-[240px] sm:min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-center bg-white rounded-2xl shadow-sm animate-pulse p-6"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
