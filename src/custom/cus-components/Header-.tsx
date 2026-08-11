'use client';

import React from "react";
import { FaBars } from "react-icons/fa";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import Image from "next/image";
//import { menuItems } from "@/confing/menuItems";
import Link from "next/link";
//import ContactButtonMini from "./ContactButtonMini";


export default function Header() {
  const { bargerMenuToggle } = UseSiteContext();

  return (
    <header className="w-full fixed top-0 z-50  bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-3 px-6 flex items-center justify-between">
        {/* Logo with background so white logo is visible */}
        <div className=" p-2 rounded">
          <Link href={"/"}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={170}
             height={170}
            className="object-contain h-8 w-auto"
            priority
          />
          </Link>
        </div>

        {/* Navigation */}
        {/* <nav className="hidden lg:flex items-center space-x-6">
          {menuItems.map(({ title, href }) => (
            <a
              key={title}
              href={href}
              onClick={() => bargerMenuToggle(false)}
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              {title}
            </a>
          ))}
            <ContactButtonMini />
        </nav> */}

        {/* Mobile Burger */}
        <button
          onClick={() => bargerMenuToggle(true)}
          className="lg:hidden text-gray-800"
          aria-label="toggle burger menu"
        >
          <FaBars size={28} />
        </button>
      
      </div>
    </header>
  );
}
