"use client";

import Image from "next/image";

export default function HeroImageClassic() {
  return (
    <div className="w-full flex justify-center items-center px-2">
      <div className="relative max-w-7xl mx-auto mx-auto ">
        <Image
          src="/images/hero-3.jpg"
          alt="Lakeside Außenansicht"
          width={2560}
          height={1920}
          priority
          className="rounded-lg shadow-md object-cover h-auto"
        />
      </div>
    </div>
  );
}
