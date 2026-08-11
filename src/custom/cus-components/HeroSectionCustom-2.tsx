"use client";

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
    <section className="relative w-full overflow-hidden">

      {/* ================= HERO IMAGE ================= */}
      <div className="relative w-full h-[60vh] md:h-[95vh]">

        <Image
          src="/images/hero-15.jpg"
          alt="Restaurant background"
          fill
          className="object-cover scale-105"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        {/* LOGO */}
        <div className="absolute top-6 left-6 md:top-10 md:left-12 z-20">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/40">
            <img
              src="/logo-10.png"
              alt="Logo"
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          </div>
        </div>

        {/* TEXT CONTENT */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">

            <div className="max-w-xl text-white backdrop-blur-sm bg-white/10 p-6 md:p-8 rounded-2xl shadow-lg">

              {/* Title */}
              <h2
                className={`${chicle.className} text-4xl md:text-6xl mb-3`}
              >
                Food App
              </h2>

              {/* Subtitle */}
              <p className="text-sm md:text-base text-white/80 mb-4">
                Authentic flavors crafted with passion 🍛
              </p>

              {/* Features */}
              <ul className="space-y-2 text-sm md:text-base mb-5">
                <li className="flex items-center gap-2">
                  <FaThumbsUp /> No platform fees
                </li>
                <li className="flex items-center gap-2">
                  <FaShieldAlt /> No payment fees
                </li>
                <li className="flex items-center gap-2">
                  <FaSmile />
                  1235{" "}
                  <a
                    href="#"
                    className="underline hover:text-green-300"
                  >
                    Guest Recommendations
                  </a>
                </li>
              </ul>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">

                <Link
                  href="/#order_now"
                  className={`${chicle.className} bg-gradient-to-r from-[#ea9244] to-[#ffb36b] hover:opacity-90 text-white text-lg md:text-xl px-6 py-2 rounded-xl shadow-md transition text-center`}
                >
                  🍴 ORDER MENU
                </Link>

                <Link
                  href="/menu"
                  className={`${chicle.className} bg-white/90 backdrop-blur text-[#ea9244] text-lg md:text-xl px-6 py-2 rounded-xl border border-white/40 hover:bg-white transition text-center`}
                >
                  Menu
                </Link>

              </div>
            </div>
          </div>
        </div>

        {/* Smooth Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white rounded-t-[40%]" />
      </div>
    </section>
  );
}