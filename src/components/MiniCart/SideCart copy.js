 
  
  "use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "react-use";
import { IoClose } from "react-icons/io5";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import MiniCartContent from "./MiniCartcontent";
import { MiniCartSubtotal } from "./MiniSubtotal";
import ProccedWithEmail from "./components/ProccedWithEmail";
import { useCartContext } from "@/store/CartContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/store/LanguageContext";

const framerSidebarBackground = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.2 } },
  transition: { duration: 0.3 },
};

const framerSidebarPanel = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.3 },
};

export const SideCart = () => {
  const { TEXT } = useLanguage();
  const { open, sideBarToggle } = UseSiteContext();
  const { openEmailForm, emailFormToggle, customerEmail } = UseSiteContext();
  const { cartData } = useCartContext();
  const ref = useRef(null);
  const router = useRouter();
  useClickAway(ref, () => sideBarToggle());

  function pickUpHandle() {
    sideBarToggle();
    if (!customerEmail) {
      emailFormToggle(true);
    } else {
      router.push(`/checkout`);
    }
  }

  function shopMoreHandle() {
    sideBarToggle();
    router.push("/");
  }

  return (
    <div translate="no" className="z-50">
      {typeof window !== "undefined" && !openEmailForm && (
        <AnimatePresence mode="wait" initial={false}>
          {open && (
            <>
              {/* Background blur */}
              <motion.div
                {...framerSidebarBackground}
                aria-hidden="true"
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              ></motion.div>

              {/* Sidebar panel */}
              <motion.div
                {...framerSidebarPanel}
                ref={ref}
                className="fixed top-0 bottom-0 left-0 z-50 w-full max-w-md h-screen bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r border-gray-200 flex flex-col"
                aria-label="Sidebar"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <span className="text-lg font-semibold text-gray-800">
                    {TEXT.cart_sidebar_title}
                  </span>
                  <button
                    onClick={sideBarToggle}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="close sidebar"
                  >
                    <IoClose size={26} />
                  </button>
                </div>

                {/* Cart content */}
                <div className="flex-1 overflow-y-auto p-3">
                  <MiniCartContent />
                </div>

                {/* Subtotal & Actions */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <MiniCartSubtotal />

                  <div className="flex flex-col items-center justify-center gap-3 mt-4">
                    {cartData.length ? (
                      <button
                        onClick={pickUpHandle}
                        className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        {TEXT.checkout_button}
                      </button>
                    ) : (
                      <div className="text-gray-500 font-medium text-center">
                        {TEXT.empty_cart_message}
                      </div>
                    )}

                    <button
                      onClick={shopMoreHandle}
                      className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all"
                    >
                      {TEXT.shop_more_button}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
      {openEmailForm && <ProccedWithEmail />}
    </div>
  );
};
