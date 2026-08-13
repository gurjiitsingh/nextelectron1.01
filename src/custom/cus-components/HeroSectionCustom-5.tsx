"use client";
/* magazine / food showcase hero (not centered, not glass, not classic overlay). */
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionEditorial() {
  return (
    <section className="relative w-full h-[85vh] overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero-12.jpg"
        alt="Food background"
        fill
        className="object-cover"
        priority
      />

      {/* Soft gradient (bottom focus) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Floating Rating Badge */}
      <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
        <FaStar className="text-yellow-500" />
        <span className="text-sm font-semibold text-black">4.8 Rating</span>
      </div>

      {/* Content Bottom Left */}
      <div className="absolute bottom-0 left-0 w-full px-6 pb-10 md:px-16 md:pb-16">

        <div className="max-w-2xl text-white">

          {/* Tagline */}
          <p className="uppercase tracking-widest text-sm text-[#ea9244] mb-2">
            Authentic Indian Taste
          </p>

          {/* Title */}
          <h1
            className={`${chicle.className} text-4xl md:text-6xl leading-tight mb-4`}
          >
            Food App
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-white/80 mb-6">
            Experience rich spices, fresh ingredients, and flavors crafted
            with love. Order your favorites in just a few clicks.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">

            <Link
              href="/#order_now"
              className="bg-[#ea9244] hover:bg-[#ff7b00] text-white px-6 py-3 rounded-full text-sm md:text-base font-semibold transition shadow-lg"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="bg-white text-black px-6 py-3 rounded-full text-sm md:text-base font-semibold hover:bg-gray-200 transition"
            >
              View Menu
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}