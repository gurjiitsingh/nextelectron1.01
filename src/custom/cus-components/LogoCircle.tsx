import Link from "next/link";
import React from "react";

export default function LogoCircle() {
  return (
    <div className="flex flex-col items-center justify-center mt-[60px]  pt-15 pb-3 my-2 md:my-0">
      <div className="flex rounded-bl-full rounded-tl-full rounded-br-xl rounded-tr-2xl   p-3 border-3 border-[#2B2E4A]">
        <div className="w-35 h-35 rounded-full bg-[#2B2E4A] flex items-center justify-center shadow-lg" data-aos="fade-right">
          <img
            src="/logo-10.webp"
            alt="Logo"
            className="w-28 h-28 object-contain"
          />
        </div>

        <div className="flex flex-col  shadow-md m-2 md:m-3 p-2 md:p-3 justify-between rounded-xl">
          <div className="mt-1 " data-aos="fade-left">
            <Link
              href="https://eat.allo.restaurant/restaurant/masala-taste-of-india"
              // target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-block bg-[#2B2E4A] text-white font-semibold md:text-lg px-3 py-1 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-200"
            >
              🍴 Order Menu
            </Link>
          </div>
            <div className="mt-1" data-aos="fade-left">
            <Link
              href="/#bf"
              // target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-block bg-slate-300 text-white font-semibold text-md md:text-lg px-3 py-1 rounded-lg shadow-md hover:bg-slate-400 transition-all duration-200"
            >
              Buffet 
            </Link>
          </div>
        </div>
      </div>
      <h1 className="text-md w-full h-5 text-right pt-1 ">Food App</h1>
    </div>
  );
}
