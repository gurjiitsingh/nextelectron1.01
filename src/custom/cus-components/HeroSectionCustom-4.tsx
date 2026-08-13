"use client";
/* Glass Card + Center Focus */
import Image from "next/image";
import { FaThumbsUp, FaShieldAlt, FaSmile } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionModern3() {
  return (
    <section className="relative w-full h-[85vh] overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero-12.jpg"
        alt="Restaurant background"
        fill
        className="object-cover scale-105"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

      {/* Center Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">

        {/* Glass Card */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 md:p-10 max-w-xl w-full text-center shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <img
                src="/logo-10.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <h1
            className={`${chicle.className} text-4xl md:text-5xl text-white mb-3`}
          >
            Food App
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-sm mb-4">
            Authentic taste. Fast delivery. No hidden charges.
          </p>

          {/* Features */}
          <div className="flex flex-col gap-2 text-sm mb-5">
            <div className="flex items-center justify-center gap-2 text-white">
              <FaThumbsUp />
              No platform fees
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <FaShieldAlt />
              Secure payments
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <FaSmile />
              1235+ happy customers
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 justify-center">

            <Link
              href="/#order_now"
              className="bg-[#ea9244] hover:bg-[#ff7b00] text-white px-6 py-2 rounded-xl text-lg font-semibold transition"
            >
              🍴 Order Now
            </Link>

            <Link
              href="/menu"
              className="bg-white/20 hover:bg-white text-white hover:text-black px-6 py-2 rounded-xl text-lg font-semibold transition border border-white/30"
            >
              View Menu
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}