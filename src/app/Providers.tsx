'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/store/CartProvider';
import { SiteProvider } from '@/SiteContext/SiteProvider';
import { LanguageProvider } from '@/store/LanguageContext';
//import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    //  <SessionProvider>
    <SiteProvider>
      <CartProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </CartProvider>
    </SiteProvider>
    // </SessionProvider>
  );
}
