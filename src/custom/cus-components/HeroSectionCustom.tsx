"use client";

/*
========================================
Hero Name: Spotlight Layered Hero
Concept:
- Full background image with spotlight lighting effect
- Multiple gradient layers (radial + linear)
- Focus center-left (like product spotlight)
- Floating glow + depth illusion
- Cinematic / premium food branding feel
========================================
*/

import Image from "next/image";
import { FaFire, FaStar } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionSpotlight() {
  return (
    <section className="relative w-full min-h-[95vh] overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero-15.jpg"
        alt="Food background"
        fill
        className="object-cover scale-110"
        priority
      />

      {/* 🔥 Radial spotlight (center focus) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,0,0,0.2),rgba(0,0,0,0.85))]" />

      {/* 🔥 Bottom depth layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/*  Side gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/40" />

      {/*  Glow Accent */}
      <div className="absolute top-32 left-10 w-72 h-72 bg-[#ea9244]/30 blur-3xl rounded-full" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 min-h-[95vh] flex items-center">

        <div className="max-w-2xl text-white">

          {/* Tag */}
          <div className="flex items-center gap-2 mb-4 text-[#ea9244] text-sm">
            <FaFire />
            Trending Now
          </div>

          {/* Title */}
          <h1
            className={`${chicle.className} text-5xl md:text-7xl leading-tight mb-6`}
          >
            {/* Spice Up  
            <br /> */}
             Food App
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg">
            From rich curries to sizzling delights — experience food
            that excites every bite.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <Link
              href="/#order_now"
              className="bg-[#ea9244] hover:bg-[#ff7b00] text-white px-7 py-3 rounded-full text-sm font-semibold shadow-xl transition"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="border border-white/40 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              Explore Menu
            </Link>

          </div>
        </div>
      </div>

      {/* Floating Highlight Card */}
      <div className="absolute bottom-10 right-6 md:right-16 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <FaStar className="text-yellow-500" />
        <div className="text-sm">
          <p className="font-semibold text-black">Top Rated Dish</p>
          <p className="text-gray-600 text-xs">Loved by customers</p>
        </div>
      </div>

    </section>
  );
}