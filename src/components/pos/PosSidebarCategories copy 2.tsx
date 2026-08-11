"use client";

import { useEffect, useState } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";

export type CategoryType = {
  id: string;
  name: string;
  desc?: string;
  productDesc?: string;
  slug?: string;
  image?: string;
  isFeatured?: boolean | string;
  sortOrder?: number;
  disablePickupDiscount?: boolean;
};

export default function PosSidebarCategories() {
  const [categoryData, setCategoryData] = useState<CategoryType[]>([]);
  const [displayCategory, setDisplayCategory] = useState<string | null>(null);

  const {
    productCategoryIdG,
    setProductCategoryIdG,
    setDisablePickupCatDiscountIds,
    settings,
  } = UseSiteContext();

  /** ------------------------------------------
   *  Sync selected category with global + fallback
   *  ------------------------------------------ */
  useEffect(() => {
    if (!productCategoryIdG) {
      setDisplayCategory(settings?.display_category?.toString() ?? null);
    } else {
      setDisplayCategory(productCategoryIdG);
    }
  }, [settings, productCategoryIdG]);

  /** ------------------------------------------
   *  Load Categories
   *  ------------------------------------------ */
 useEffect(() => {
  let isMounted = true;

  async function load() {
    try {
      // Read categories from SQLite through Electron preload API
      const categories: CategoryType[] =
        await window.posApi.getAllCategories();

      if (!isMounted) return;

      // Sort exactly like Android Room query
      categories.sort(
        (a, b) =>
          Number(a.sortOrder ?? 0) -
          Number(b.sortOrder ?? 0)
      );

      // Keep your existing featured filter
      const featured = categories.filter(
        (c) => c.isFeatured !== 'no'
      );

      setCategoryData(featured);

      // Pickup-discount disabled categories
      const pickupDisabled = categories
        .filter(
          (c) =>
            c.disablePickupDiscount === true
        )
        .map((c) => c.id);

      setDisablePickupCatDiscountIds(
        pickupDisabled
      );
    } catch (e) {
      console.error(
        'SQLite category load error:',
        e
      );
    }
  }

  load();

  return () => {
    isMounted = false;
  };
}, [setDisablePickupCatDiscountIds]);

  return (
    <aside className="w-full h-full bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Categories
        </h2>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {/* "All Items" Reset Button */}
        <button
          onClick={() => setProductCategoryIdG("")}
          className={`
            group
            relative
            w-full
            h-14
            rounded-xl
            transition-all
            duration-200
            flex
            items-center
            gap-3
            px-3
            cursor-pointer
            ${
              !displayCategory
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
            }
          `}
        >
          {/* Active Accent Indicator */}
          {!displayCategory && (
            <span className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-full" />
          )}

          <div
            className={`
              w-10
              h-10
              rounded-lg
              flex
              items-center
              justify-center
              shrink-0
              ${!displayCategory ? "bg-white/20" : "bg-slate-800"}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6a0.75 0.75 0 0 1 0.75-.75h15a0.75 0.75 0 0 1 0 1.5h-15A0.75 0.75 0 0 1 3.75 6Zm0 6a0.75 0.75 0 0 1 0.75-.75h15a0.75 0.75 0 0 1 0 1.5h-15A0.75 0.75 0 0 1 3.75 12Zm0 6a0.75 0.75 0 0 1 0.75-.75h15a0.75 0.75 0 0 1 0 1.5h-15A0.75 0.75 0 0 1 3.75 18Z"
              />
            </svg>
          </div>

          <div className="flex-1 text-left">
            <p className="font-semibold text-sm leading-tight">All Items</p>
            <p
              className={`text-[11px] ${
                !displayCategory ? "text-indigo-200" : "text-slate-400"
              }`}
            >
              Show entire menu
            </p>
          </div>
        </button>

        {/* Dynamic Category List */}
        {categoryData.map((cat) => {
          const active = displayCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setProductCategoryIdG(cat.id)}
              className={`
                group
                relative
                w-full
                h-14
                rounded-xl
                transition-all
                duration-200
                flex
                items-center
                gap-3
                px-3
                cursor-pointer
                ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }
              `}
            >
              {/* Active Accent Indicator Bar */}
              {active && (
                <span className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-full" />
              )}

              {/* Category Image Avatar */}
              <div
                className={`
                  w-10
                  h-10
                  rounded-lg
                  overflow-hidden
                  shrink-0
                  flex
                  items-center
                  justify-center
                  ${active ? "bg-white/20" : "bg-slate-800"}
                `}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                    />
                  </svg>
                )}
              </div>

              {/* Category Text Information */}
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">
                  {cat.name}
                </p>
                {cat.productDesc && (
                  <p
                    className={`text-[11px] truncate ${
                      active ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {cat.productDesc}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}