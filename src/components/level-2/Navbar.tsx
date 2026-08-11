import Link from "next/link";
import React from "react";
import { useLanguage } from '@/store/LanguageContext';

function Navbar() {
  const { TEXT, BRANDING } = useLanguage();

  return (
    <nav>
      <ul className="hidden lg:w-full lg:flex lg:gap-3 lg:items-center">
        {BRANDING.menu.map((item: { link: string; name: string }) => (
          <li className="fit navbar-link" key={item.name}>
            <Link  className="text-sm font-medium  hover:text-black transition" href={item.link}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
