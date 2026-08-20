import "@/app/globals.css";

import { Toaster } from "react-hot-toast";

import "@/css/style.css";

import { Providers } from "../Providers";

import { BargerMenu } from "@/components/Bargermenu/Menu";
import Modal from "@/components/level-1/Modal";

import PosTopBar from "@/components/pos/home/PosTopBar";

import { PosUiProvider } from "@/PosUiStore/PosUiContext";
import { PosSessionProvider } from "@/PosSessionStore/PosSessionContext";
import { PosThemeProvider } from "@/PosThemeStore/PosThemeContext";

import { PosAuthProvider } from "@/store/PosAuthContext";

import PosAuthGate from "@/components/pos/auth/PosAuthGate";
import { SideCart } from "@/components/MiniCart/SideCart";


// =====================================================
// HOME / POS LAYOUT
// =====================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div className="text-[#2B2E4A]">

      <div translate="no">

        <PosAuthProvider>

          <PosThemeProvider>

            <PosUiProvider>

              <PosSessionProvider>

                <Providers>

                  <BargerMenu />

                  <Modal />


                  {/* =================================================
                      POS AUTHENTICATION BOUNDARY
                  ================================================= */}

                  <PosAuthGate>

                    <div
                      className="
                        flex
                        h-screen
                        flex-col
                      "
                    >

                       <div className="z-50 shrink-0">
                    <SideCart />
                  </div>

                      {/* =================================================
                          TOP BAR
                      ================================================= */}

                      <div
                        className="
                          z-50
                          shrink-0
                        "
                      >
                        <PosTopBar />
                      </div>


                      {/* =================================================
                          POS CONTENT
                      ================================================= */}

                      <main
                        className="
                          min-h-0
                          flex-1
                          overflow-hidden
                          relative
                        "
                      >

                        {children}

                      </main>

                    </div>

                  </PosAuthGate>


                </Providers>

              </PosSessionProvider>

            </PosUiProvider>

          </PosThemeProvider>

        </PosAuthProvider>


        {/* =================================================
            TOASTER
        ================================================= */}

        <Toaster
          position="top-center"
          containerStyle={{
            top: "30%",
          }}
          toastOptions={{
            style: {
              borderRadius: "10px",
              padding: "12px 16px",
            },

            className:
              "toast-default",

            success: {
              className:
                "toast-success",
            },

            error: {
              className:
                "toast-error",
            },

            loading: {
              className:
                "toast-loading",
            },
          }}
          reverseOrder={false}
        />

      </div>

    </div>

  );
}