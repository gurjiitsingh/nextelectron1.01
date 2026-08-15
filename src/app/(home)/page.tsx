'use client';

import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
import Products from "@/components/level-1/Products";
import RightSideBar from "@/components/pos/rightSideBar/RightSidebar";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";

export default function Page() {

  const { background } = usePosTheme();

  return (
    <div
      className={`
        h-screen
        flex
        flex-col
        overflow-hidden
        ${background.className}
        ${background.text}
      `}
    >

      <main
        className={`
          flex-1
          flex
          min-h-0
          p-0
          m-0
          overflow-hidden
          ${background.className}
          ${background.text}
        `}
      >

        {/* LEFT SIDEBAR */}
        <aside
          className={`
            w-[250px]
            shrink-0
            overflow-y-auto
            border-r
            ${background.border}
            ${background.className}
          `}
        >
          <PosSidebarCategories />
        </aside>

        {/* PRODUCTS */}
        <section
          className={`
            flex-1
            overflow-y-auto
            mx-0
            px-0
            app-scrollbar
            ${background.className}
          `}
        >
          <Products />
        </section>

        {/* RIGHT SIDEBAR */}
        <aside
          className={`
            xl:flex
            w-[440px]
            border-l
            ${background.border}
            ${background.className}
          `}
        >
          <RightSideBar />
        </aside>

      </main>
    </div>
  );
}