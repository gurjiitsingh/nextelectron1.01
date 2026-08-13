"use client";

/*
========================================
Hero Name: Asymmetric Highlight Hero
Concept:
- Left side = strong branding text
- Right side = highlighted food image
- Asymmetric modern layout
- Focus on one “signature dish”
- Feels like premium restaurant landing
========================================
*/

import Image from "next/image";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionAsymmetric() {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#faf7f2] overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT CONTENT */}
        <div>

          {/* Tag */}
          <p className="text-[#ea9244] uppercase tracking-widest text-xs mb-3">
            Chef’s Special
          </p>

          {/* Title */}
          <h1
            className={`${chicle.className} text-4xl md:text-6xl text-[#2b2b2b] leading-tight mb-5`}
          >
            Taste the Real  
            <br /> Food App
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm md:text-base mb-6 max-w-md">
            A perfect blend of spices, slow-cooked to perfection.
            Experience the richness of authentic Indian flavors.
          </p>

          {/* Buttons */}
          <div className="flex gap-4">

            <Link
              href="/#order_now"
              className="bg-[#ea9244] hover:bg-[#ff7b00] text-white px-6 py-3 rounded-full text-sm font-semibold transition shadow-md"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="text-[#ea9244] border border-[#ea9244] px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#ea9244] hover:text-white transition"
            >
              Explore Menu
            </Link>

          </div>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="relative flex justify-center items-center">

          {/* Background shape */}
          <div className="absolute w-[300px] h-[300px] md:w-[420px] md:h-[420px] bg-[#ea9244]/20 rounded-full blur-2xl" />

          {/* Main Dish Image */}
          <div className="relative z-10">
            <Image
              src="/images/hero-12.jpg"
              alt="Signature dish"
              width={400}
              height={400}
              className="rounded-3xl object-cover shadow-2xl"
            />
          </div>

          {/* Floating Badge */}
          <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold">
            ⭐ Bestseller
          </div>
        </div>

      </div>
    </section>
  );
}