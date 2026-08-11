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
  const [displayCategory, setDisplayCategory] =
    useState<string | null>(null);

  const {
    productCategoryIdG,
    setProductCategoryIdG,
    setDisablePickupCatDiscountIds,
    settings,
  } = UseSiteContext();

  useEffect(() => {
    if (!productCategoryIdG) {
      setDisplayCategory(
        settings?.display_category?.toString() ?? null
      );
    } else {
      setDisplayCategory(productCategoryIdG);
    }
  }, [settings, productCategoryIdG]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const categories: CategoryType[] =
          await window.posApi.getAllCategories();

        if (!isMounted) return;

        categories.sort(
          (a, b) =>
            Number(a.sortOrder ?? 0) -
            Number(b.sortOrder ?? 0)
        );

        const featured = categories.filter(
          (c) => c.isFeatured !== "no"
        );

        setCategoryData(featured);

        const pickupDisabled = categories
          .filter((c) => c.disablePickupDiscount === true)
          .map((c) => c.id);

        setDisablePickupCatDiscountIds(pickupDisabled);
      } catch (error) {
        console.error(
          "SQLite category load error:",
          error
        );
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [setDisablePickupCatDiscountIds]);

  return (
    <aside className="h-full w-full bg-white flex flex-col">
      <div className="h-12 shrink-0 flex items-center px-4 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Categories
        </span>
      </div>

      <div className="pos-sidebar-scroll flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <button
          type="button"
          onClick={() => setProductCategoryIdG("")}
          className={`
            w-full
            h-11
            px-3
            flex
            items-center
            text-left
            border
            transition-colors
            ${
              !displayCategory
                ? "bg-slate-800 border-slate-800 text-white"
                : "bg-white border-transparent text-slate-700 hover:bg-slate-100"
            }
          `}
        >
          <span className="text-sm font-medium">
            All Items
          </span>
        </button>

        {categoryData.map((cat) => {
          const active = displayCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setProductCategoryIdG(cat.id)}
              className={`
                w-full
                h-11
                px-3
                flex
                items-center
                text-left
                
                text-sm
                
              
                transition-colors
                ${
                  active
                    ? "bg-slate-400 border-slate-600 text-white"
                    : "bg-slate-200 border-transparent text-slate-600  "
                }
              `}
            >
              <span className="text-[12px] font-medium truncate">
  {cat.name}
</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}