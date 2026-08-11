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
      
      {/* ==========================
          HERO IMAGE WITH LOGO
      =========================== */}
      <div className="relative w-full h-[50vh] md:h-[90vh] flex items-center justify-center">

        <Image
          src="/images/hero-12.jpg"
          alt="Restaurant background"
          fill
          className="object-cover"
          priority
        />

        {/* dark overlay (transparent right now) */}
        <div className="absolute inset-0 bg-black/0 md:bg-black/0" />

        {/* LOGO inside container with padding */}
        <div className="absolute bottom-[13rem] md:bottom-auto md:top-40 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-center md:justify-start z-20">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center shadow-lg"
              data-aos="fade-right"
            >
              <img
                src="/logo-10.png"
                alt="Logo"
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>
          </div>
        </div>

        {/* curved transition bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white rounded-t-[50%]" />
      </div>

      {/* ==========================
          TEXT + BUTTONS
      =========================== */}
      <div
        className="
        relative
        bg-white
        md:bg-transparent
        md:absolute
        md:inset-0
        md:flex
        md:items-center
        md:justify-center
      "
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex justify-center md:justify-start">

          <div className="text-[#2b2b2b] md:text-white max-w-lg pb-6 mt-[-60px] md:mt-0">

            {/* Title */}
            <h2
              className={`${chicle.className} text-4xl md:text-5xl my-3 text-[#ea9244] md:text-white`}
            >
              Food App
            </h2>

            {/* Features */}
            <ul className="space-y-2 text-base text-[12px]">
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#5e8147] md:text-white">
                <FaThumbsUp className="text-[#5e8147] md:text-white" />
                No platform fees
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#5e8147] md:text-white">
                <FaShieldAlt className="text-[#5e8147] md:text-white" />
                No payment fees
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#5e8147] md:text-white">
                <FaSmile className="text-[#5e8147] md:text-white" />
                1235{" "}
                <a
                  href="#"
                  className="underline text-[#5e8147] md:text-white hover:text-green-400"
                >
                  Guest Recommendations
                </a>
              </li>
            </ul>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-start gap-4 pt-4">
              <Link
                href="/#order_now"
                rel="noopener noreferrer"
                data-aos="fade-left"
                className={`${chicle.className} bg-[#ea9244] border-white border-2 hover:bg-[#657f53] text-2xl text-white font-semibold px-6 py-1 rounded-xl transition text-center tracking-wide`}
              >
                🍴 ORDER MENU
              </Link>

              <Link
                href="/menu"
                rel="noopener noreferrer"
                className={`${chicle.className} bg-white text-[#ea9244] text-2xl font-bold px-6 py-1 rounded-xl border border-[#ea9244] hover:bg-[#5e8147] hover:text-white transition text-center`}
              >
                Menu
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
