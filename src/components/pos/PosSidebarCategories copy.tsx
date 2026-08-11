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
      setDisplayCategory(settings.display_category?.toString() ?? null);
    } else {
      setDisplayCategory(productCategoryIdG);
    }
  }, [settings, productCategoryIdG]);

  /** ------------------------------------------
   *  Load Categories
   *  ------------------------------------------ */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/categories");
        const categories: CategoryType[] = await res.json();

        categories.sort(
          (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)
        );

        // Only featured categories (your logic)
        const featured = categories.filter(
          (c) => c.isFeatured !== "no"
        );
        setCategoryData(featured);

        // Pickup discount disabled categories
        const pickupDisabled = categories
          .filter((c) => c.disablePickupDiscount === true)
          .map((c) => c.id);
        setDisablePickupCatDiscountIds(pickupDisabled);
      } catch (e) {
        console.error("Category load error:", e);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-1">
    

      {categoryData.map((cat) => {
        const active = displayCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => setProductCategoryIdG(cat.id)}
            className={`w-full text-left px-1 py-1 rounded-lg transition flex items-center gap-2
              ${active 
                ? "bg-green-600 text-white font-semibold shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {/* Image (small + clean) */}
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={cat.image || "/com.jpg"}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Category Name */}
            <span className="text-sm font-medium">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
