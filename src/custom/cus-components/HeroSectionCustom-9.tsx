"use client";

/*
========================================
Hero Name: Layered Gradient Premium Hero
Concept:
- Full background image with layered gradients
- Floating UI elements (badges/cards)
- Modern SaaS + Food app hybrid look
- Depth using blur + overlays
- High-end production ready design
========================================
*/

import Image from "next/image";
import { FaStar, FaMotorcycle } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionLayered() {
  return (
    <section className="relative w-full min-h-[95vh] overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero-12.jpg"
        alt="Food background"
        fill
        className="object-cover scale-110"
        priority
      />

      {/* Gradient Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Floating Blur Shape */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#ea9244]/30 blur-3xl rounded-full" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 min-h-[95vh] flex flex-col justify-center">

        <div className="max-w-2xl text-white">

          {/* Tag */}
          <p className="text-[#ea9244] uppercase tracking-[0.3em] text-xs mb-4">
            Fast • Fresh • Authentic
          </p>

          {/* Title */}
          <h1
            className={`${chicle.className} text-5xl md:text-7xl leading-tight mb-6`}
          >
            Delicious Food  
            <br /> Delivered Fast
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg">
            Order your favorite meals with zero hassle.  
            No platform fees, just great food and quick delivery.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <Link
              href="/#order_now"
              className="bg-[#ea9244] hover:bg-[#ff7b00] text-white px-7 py-3 rounded-xl text-sm font-semibold shadow-lg transition"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              View Menu
            </Link>

          </div>
        </div>
      </div>

      {/* Floating Cards */}

      {/* Rating Card */}
      <div className="absolute bottom-10 left-6 md:left-12 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
        <FaStar className="text-yellow-500" />
        <span className="text-sm font-semibold text-black">4.8 Rating</span>
      </div>

      {/* Delivery Card */}
      <div className="absolute top-24 right-6 md:right-16 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
        <FaMotorcycle className="text-[#ea9244]" />
        <span className="text-sm font-semibold text-black">30 min delivery</span>
      </div>

    </section>
  );
}