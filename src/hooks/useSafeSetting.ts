import { useMemo } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { BRANDING } from "@/config/languages";

// Dynamically infer all keys in TEXT
type SafeSettingKey = keyof typeof BRANDING;

export function useSafeSetting<K extends SafeSettingKey>(key: K): typeof BRANDING[K] {
  const { settings } = UseSiteContext();

  return useMemo(() => {
    const value = settings?.[key];
    const fallback = BRANDING[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value as typeof BRANDING[K];
    }

    return (value ?? fallback) as typeof BRANDING[K];
  }, [settings, key]);
}
