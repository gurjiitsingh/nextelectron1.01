'use client';

import { useUTMTracker } from '@/hooks/useUTMTracker';

export default function UTMInitializer() {
 useUTMTracker();
  return null; // No UI, just logic
}
