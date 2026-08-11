import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
 
import "@/css/style.css";
import UTMInitializer from "../UTMInitializer";
import { Providers } from "../Providers";
import SafeSideCart from "./SafeSideCart";

import { BargerMenu } from "@/components/Bargermenu/Menu";
import Modal from "@/components/level-1/Modal";
import Header from "@/custom/cus-components/Header";


import { SEO } from "@/config/languages";
import { getDynamicSEO } from "@/lib/seo/getSeo";
import SyncButton from "./SyncButton";
import PosTopBar from "@/components/pos/home/PosTopBar";




// import FooterWrapper from "@/components/FooterWrapper";


export async function generateMetadata(): Promise<Metadata> {
  const dynamicSEO = await getDynamicSEO();

  const title = dynamicSEO?.title || SEO.title;
  const description = dynamicSEO?.description || SEO.description;

  const url = dynamicSEO?.url || "";
  const ogImage = dynamicSEO?.ogImage || "/og-image.jpg";

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      url,
      siteName: title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ✅ ADD THIS LINE (VERY IMPORTANT)
export const revalidate = 3600; // 1 hour cache

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
 
        <div className="text-[#2B2E4A] overflow-hidden">
          <div translate="no">
            <UTMInitializer />

            <Providers>
              <BargerMenu />
              <Modal />

              <div className="flex flex-col gap-0 my-0">
                <div className="z-50">
                  <SafeSideCart />
                </div>

              {/* NEW TOP BAR */}
      <PosTopBar />

                {children}

              

             
              </div>
            
            </Providers>

            <Toaster
              position="top-center"
              containerStyle={{ top: "30%" }}
              toastOptions={{
                style: {
                  borderRadius: "10px",
                  padding: "12px 16px",
                },
                className: "toast-default",
                success: { className: "toast-success" },
                error: { className: "toast-error" },
                loading: { className: "toast-loading" },
              }}
              reverseOrder={false}
            />
          </div>
        </div>
   
  );
}