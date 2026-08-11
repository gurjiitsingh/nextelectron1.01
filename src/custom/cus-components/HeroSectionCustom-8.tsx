"use client";

/*
========================================
Hero Name: Asymmetric Background Blend Hero
Concept:
- Full background food image
- Left side = content (clean + readable)
- Right side = still visually heavy (image focus)
- Uses gradient overlay for readability
- Premium + modern + conversion focused
========================================
*/

import Image from "next/image";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionAsymmetricBG() {
  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero-12.jpg"
        alt="Food background"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlay (left readable, right visible image) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 min-h-[90vh] flex items-center">

        <div className="max-w-xl text-white">

          {/* Tag */}
          <p className="text-[#ea9244] uppercase tracking-widest text-xs mb-3">
            Chef’s Special
          </p>

          {/* Title */}
          <h1
            className={`${chicle.className} text-4xl md:text-6xl leading-tight mb-5`}
          >
            Taste the Real  
            <br /> Food App
          </h1>

          {/* Description */}
          <p className="text-white/80 text-sm md:text-base mb-6">
            A perfect blend of spices, slow-cooked to perfection.
            Experience authentic Indian flavors like never before.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <Link
              href="/#order_now"
              className="bg-[#ea9244] hover:bg-[#ff7b00] text-white px-6 py-3 rounded-full text-sm font-semibold transition shadow-lg"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="border border-white text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              Explore Menu
            </Link>

          </div>

        </div>
      </div>

      {/* Optional Floating Badge (bottom-right) */}
      <div className="absolute bottom-6 right-6 bg-white text-black px-4 py-2 rounded-xl shadow-lg text-sm font-semibold">
        ⭐ Bestseller Dish
      </div>

    </section>
  );
}