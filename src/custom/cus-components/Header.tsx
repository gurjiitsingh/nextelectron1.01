"use client";

import { useEffect, useState } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import dynamic from "next/dynamic";
import Navbar from "@/components/level-2/Navbar";
import Login from "../../components/buttons/Login";
import { LanguageSwitcher } from "../../languages/LanguageSwitcher";

export const headerFlags = {
  SHOW_LANGUAGE_SWITCHER: process.env.NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER === "1",
  SHOW_LOGIN_BUTTON: process.env.NEXT_PUBLIC_SHOW_LOGIN_BUTTON === "1",
};

const FaBars = dynamic(
  () => import("react-icons/fa6").then((mod) => mod.FaBars),
  { ssr: false }
);

const Header = () => {
  const { bargerMenuToggle } = UseSiteContext();
  const [hasMounted, setHasMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // 👈 when scroll > 50px -> header appears
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!hasMounted) return null;

  return (
    <header
      className={`w-full fixed top-0 z-50 transition-all duration-300 
        ${scrolled ? "bg-white shadow-sm text-slate-5" : "bg-transparent shadow-none text-slate-400"}
      `}
    >
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-12  flex items-center justify-between">
        <div className="">
          <button
            onClick={() => bargerMenuToggle(false)}
            className="lg:hidden p-2 rounded-md header-toggle-hover"
            aria-label="Toggle menu"
          >
            <FaBars size={28} />
          </button>
          <Navbar />
        </div>

        <div className="flex items-center gap-3">
          {headerFlags.SHOW_LANGUAGE_SWITCHER && <LanguageSwitcher />}
          {headerFlags.SHOW_LOGIN_BUTTON && <Login />}
        </div>
      </div>
    </header>
  );
};

export default Header;
