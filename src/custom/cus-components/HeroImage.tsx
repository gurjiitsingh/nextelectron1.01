"use client";

import Link from "next/link";
import { MdOutlinePhoneIphone } from "react-icons/md";

// import { Karla } from 'next/font/google';
// const orbitron = Karla({
//   subsets: ['latin'],
//   weight: ['400', '600', '700'],
// });
// font-[orbitron]

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center ">
      {/*  Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      ></div>

      {/*  Optional dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>

      {/*  Content */}
      <div className="h-screen w-full relative z-10 flex flex-col justify-between pt-[20%]  md:pt-[5%] pb-[13%] md:pb-[3%] md: gap-6 md:gap-4    ">
        {/* Logo (optional) */}

        {/* Title */}
        <h1 className=" text-white text-5xl  md:text-7xl font-bold tracking-widest mb-2 playfair-display-800">
          MASALA
          <span>
            <br />
            Taste of India
          </span>
        </h1>

       

        {/* Services */}
        {/* <h3 className="titleH text-lg font-semibold text-white mb-3">
          Why Choose Us
        </h3>

        <div className="grid grid-cols-2 gap-y-3 text-left mb-6 max-w-lg mx-auto">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-lg">✔</span>
            <span>Fast Delivery</span>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <span className="text-red-400 text-lg">✔</span>
            <span>Quality Assurance</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-lg">✔</span>
            <span>Expert Support</span>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <span className="text-red-400 text-lg">✔</span>
            <span>Extensive Selection</span>
          </div>
        </div> */}

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* <button
  className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition"
  onClick={() => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }}
>
  CALL TODAY
</button> */}
<div className="flex gap-3 items-center justify-center w-full py-5 md:py-7   bg-slate-100 opacity-70">

          <div className="mt-1 " data-aos="fade-left">
            <Link
              href="https://eat.allo.restaurant/restaurant/masala-taste-of-india"
              // target="_blank"
              rel="noopener noreferrer"
              className="w-fit inline-block bg-red-600  text-white font-semibold md:text-lg px-3 py-1 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-200"
            >
              🍴 Order Menu
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-red-600 text-white p-2 rounded-full">
              <MdOutlinePhoneIphone size={20} />
            </div>
            <div className="text-left">
              {/* <p className="text-sm font-medium">Contact Us</p> */}
              <p className="font-bold">670 56 90 90</p>
            </div>
          </div>
</div>




        </div>

         {/* Description */}
         <div className="flex justify-center">
        <h2 className=" w-full playfair-display-400 font-playfair text-2xl md:text-4xl max-w-4xl mx-2 text-center text-white md:text-slate-700">
          Authentische Rezepte, frische Zutaten und eine Prise Tradition &ndash;
          <span className="">
            {" "}
            das ist unser Geheimnis für großartigen Geschmack.
          </span>
        </h2>
        </div>
      </div>
    </div>
  );
}
