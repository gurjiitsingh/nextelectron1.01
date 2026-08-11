"use client";
/* bold split layout (modern restaurant landing) */
import Image from "next/image";
import { FaThumbsUp, FaShieldAlt, FaSmile } from "react-icons/fa";
import { Chicle } from "next/font/google";
import Link from "next/link";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

export default function HeroSectionCustom() {
  return (
    <section className="w-full bg-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">

        {/* ================= LEFT CONTENT ================= */}
        <div className="space-y-6">

          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-[#fff5ec] flex items-center justify-center shadow">
            <img
              src="/logo-10.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Title */}
          <h1 className={`${chicle.className} text-4xl md:text-6xl text-[#2b2b2b] leading-tight`}>
            Food App
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm md:text-base max-w-md">
            Experience authentic flavors with zero extra fees. Fresh, fast, and made with love 🍛
          </p>

          {/* Features */}
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-[#5e8147]">
              <FaThumbsUp /> No platform fees
            </li>
            <li className="flex items-center gap-2 text-[#5e8147]">
              <FaShieldAlt /> No payment fees
            </li>
            <li className="flex items-center gap-2 text-[#5e8147]">
              <FaSmile />
              1235{" "}
              <a href="#" className="underline hover:text-[#ea9244]">
                Guest Recommendations
              </a>
            </li>
          </ul>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">

            <Link
              href="/#order_now"
              className={`${chicle.className} bg-[#ea9244] hover:bg-[#d87f32] text-white text-lg px-6 py-2 rounded-xl shadow transition text-center`}
            >
              🍴 ORDER MENU
            </Link>

            <Link
              href="/menu"
              className={`${chicle.className} border border-[#ea9244] text-[#ea9244] hover:bg-[#ea9244] hover:text-white text-lg px-6 py-2 rounded-xl transition text-center`}
            >
              View Menu
            </Link>

          </div>
        </div>

        {/* ================= RIGHT IMAGE ================= */}
        <div className="relative w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl">

          <Image
            src="/images/hero-12.jpg"
            alt="Food"
            fill
            className="object-cover"
            priority
          />

          {/* Soft overlay */}
          <div className="absolute inset-0 bg-black/10" />

        </div>

      </div>

    </section>
  );
}