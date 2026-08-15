"use client";

import { useEffect, useState } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";

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

  // =====================================================
  // POS THEME
  // =====================================================

  const { theme, background } = usePosTheme();

  // =====================================================
  // DISPLAY CATEGORY
  // =====================================================

  useEffect(() => {
    if (!productCategoryIdG) {
      setDisplayCategory(
        settings?.display_category?.toString() ?? null
      );
    } else {
      setDisplayCategory(productCategoryIdG);
    }
  }, [settings, productCategoryIdG]);

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

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
          .filter(
            (c) => c.disablePickupDiscount === true
          )
          .map((c) => c.id);

        setDisablePickupCatDiscountIds(
          pickupDisabled
        );
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

  // =====================================================
  // UI
  // =====================================================

  return (
    <aside
      className={`
        h-full
        w-full
        ${background.className}
        ${background.text}
        flex
        flex-col
      `}
    >
      <div
        className="
          pos-sidebar-scroll
          flex-1
          overflow-y-auto
          app-scrollbar
          px-2
          py-2
          space-y-1
        "
      >
        {categoryData.map((cat) => {
          const active =
            displayCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setProductCategoryIdG(cat.id)
              }
              className={`
                w-full
                h-11
                px-3
                flex
                items-center
                text-left
                text-sm
                border
                transition-all
                duration-100
                ${background.border}

                ${
                  active
                    ? "text-white"
                    : `${background.text} hover:opacity-80`
                }
              `}
              style={
                active
                  ? {
                      backgroundColor:
                        theme.primary,
                      borderColor:
                        theme.primary,
                    }
                  : undefined
              }
            >
              <span
                className="
                  text-[12px]
                  font-medium
                  truncate
                "
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}