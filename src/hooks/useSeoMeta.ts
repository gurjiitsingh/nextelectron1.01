import { UseSiteContext } from "@/SiteContext/SiteContext";
import { SEO } from "@/config/languages";

export function useSeoMeta() {
  const { settings } = UseSiteContext();

  const title =
    settings?.seo_title && settings.seo_title
      ? settings.seo_title
      : SEO.title;

  const description =
    settings?.seo_description && settings.seo_description
      ? settings.seo_description
      : SEO.description;

  return {
    title,
    description,
    other: {
      google: "notranslate",
    },
  };
}
