import { SEO } from "@/config/languages";

export function getSeoMetadata(): {
  title: string;
  description: string;
  other: { [key: string]: string };
} {
  return {
    title: SEO.title,
    description: SEO.description,
    other: {
      google: "notranslate",
    },
  };
}
