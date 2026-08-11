// lib/outlet/getCachedOutlet.ts
import { cache } from "react";
import { getOutlet } from "@/app/(universal)/action/outlet/dbOperation";

export const getCachedOutlet = cache(async () => {
  return await getOutlet();
});