"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function POSTopBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "POS", path: "/pos" },
    { name: "Orders", path: "/pos/orders" },
  ];

  return (
    <header className="w-full h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      
      {/* Left: Logo + App Name */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo-10.png"
          alt="Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <span className="text-sm font-semibold tracking-wide text-gray-800">
          POS
        </span>
      </div>

      {/* Center: Navigation */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium
                transition
                ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Right: Cashier Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span>POS User</span>
      </div>
    </header>
  );
}
