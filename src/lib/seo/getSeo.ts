// app/lib/seo/getSeo.ts

import { cache } from "react";
import { getCachedOutlet } from "@/lib/outlet/getCachedOutlet";

export const getDynamicSEO = cache(async () => {
  const outlet = await getCachedOutlet(); // ✅ USE CACHED VERSION

  if (!outlet) return null;

  // ✅ SAFE URL handling
  let url = "";

  if (outlet.web) {
    url = outlet.web.startsWith("http")
      ? outlet.web
      : `https://${outlet.web}`;
  }

  // ✅ CLEAN TITLE
  const title = [
    outlet.outletName,
    outlet.addressLine1,
    outlet.city,
  ]
    .filter(Boolean)
    .join(" – ");

  // ✅ CLEAN DESCRIPTION
  const description = `Order online from ${outlet.outletName}${
    outlet.city ? ` in ${outlet.city}` : ""
  }. Fresh food, fast delivery.`;

  return {
    title,
    description,

    // ✅ BETTER FALLBACK
    url: url || process.env.NEXT_PUBLIC_SITE_URL || "https://default.com",

    // ✅ FUTURE READY
    ogImage:
      (outlet as any)?.ogImage ||
      process.env.NEXT_PUBLIC_DEFAULT_OG ||
      "/og-image.jpg",
  };
});