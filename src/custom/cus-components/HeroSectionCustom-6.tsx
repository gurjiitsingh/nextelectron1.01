"use client";

/*
========================================
Hero Name: Luxury Minimal Hero
Concept:
- Premium fine-dining feel
- Focus on typography over UI elements
- Subtle overlay for readability
- Clean, elegant, distraction-free
========================================
*/

import Image from "next/image";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionLuxuryMinimal() {
  return (
    <section className="relative w-full h-[90vh] overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero-12.jpg"
        alt="Luxury dining background"
        fill
        className="object-cover"
        priority
      />

      {/* Soft dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">

        {/* Small Tagline */}
        <p className="text-white/70 tracking-[0.3em] text-xs mb-4">
          FINE DINING EXPERIENCE
        </p>

        {/* Title */}
        <h1
          className={`${chicle.className} text-5xl md:text-7xl text-white mb-6`}
        >
          Food App
        </h1>

        {/* Divider */}
        <div className="w-20 h-[1px] bg-white/50 mb-6" />

        {/* Subtitle */}
        <p className="text-white/80 max-w-md text-sm md:text-base mb-8">
          Crafted with passion. Served with elegance.  
          Discover authentic flavors in a refined atmosphere.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">

          <Link
            href="/#order_now"
            className="border border-white text-white px-8 py-3 uppercase tracking-wider text-sm hover:bg-white hover:text-black transition"
          >
            Order Now
          </Link>

          <Link
            href="/menu"
            className="bg-white text-black px-8 py-3 uppercase tracking-wider text-sm hover:bg-gray-200 transition"
          >
            View Menu
          </Link>

        </div>
      </div>
    </section>
  );
}