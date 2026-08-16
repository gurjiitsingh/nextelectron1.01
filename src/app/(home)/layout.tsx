import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

import "@/css/style.css";
 
import { Providers } from "../Providers";
import SafeSideCart from "./SafeSideCart";

import { BargerMenu } from "@/components/Bargermenu/Menu";
import Modal from "@/components/level-1/Modal";



import { SEO } from "@/config/languages";

import SyncButton from "./SyncButton";
import PosTopBar from "@/components/pos/home/PosTopBar";
import { PosUiProvider } from "@/PosUiStore/PosUiContext";
import { PosSessionProvider } from "@/PosSessionStore/PosSessionContext";
import { PosThemeProvider } from "@/PosThemeStore/PosThemeContext";
import { SideCart } from "@/components/MiniCart/SideCart";




// import FooterWrapper from "@/components/FooterWrapper";




// ✅ ADD THIS LINE (VERY IMPORTANT)
export const revalidate = 3600; // 1 hour cache

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <div className="text-[#2B2E4A]  ">
      <div translate="no">
     <PosThemeProvider>
        <PosUiProvider>
          <PosSessionProvider>

            <Providers>
              <BargerMenu />
              <Modal />

              <div className="flex flex-col gap-0 my-0">
                <div className="z-50">
                  {/* <SafeSideCart /> */}
                  <SideCart />
                </div>

                {/* NEW TOP BAR */}
                <PosTopBar />

                {children}




              </div>

            </Providers>
          </PosSessionProvider>
        </PosUiProvider>
        </PosThemeProvider>
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