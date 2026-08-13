"use client";
import { MdOutlinePhoneIphone } from "react-icons/md";

export default function QuoteBanner() {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] bg-[#f4efdf] text-white">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/large-pan.jpg')" }}
      ></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-slate-900/80"></div>

      {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <h2 className="playfair-display-400 text-2xl md:text-4xl lg:text-5xl font-medium text-center max-w-4xl mt-24">
          Unsere Expertise und Liebe zum Detail –{" "}
          <span className="font-semibold">frische Zutaten, aromatische Gewürze</span> – machen Ihre Mahlzeit bei uns zu einem unvergesslichen Erlebnis.
        </h2>
      </div>
    </section>
  );
}
