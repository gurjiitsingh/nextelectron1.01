"use client";

import { couponType } from "@/lib/types/couponType";
import { deliveryType } from "@/lib/types/deliveryType";
import { createContext, useContext } from "react";
import { SettingsDataType } from "@/lib/types/settings";
import { ProductType } from "@/lib/types/productType";

type SiteContextType = {
  allProduct: ProductType[];
  setAllProduct: (e: ProductType[]) => void;
  productToSearchQuery: string;
setProductToSearchQuery: (e: string) => void;
  // handleSearchForm: (e: string) => void;
  // setHandleSearchForm: (fn: (e: string) => void) => void;
  newOrderCondition: boolean;
  setNewOrderCondition: (e: boolean) => void;
  open: boolean;
  deliveryType: string;
  deliveryFee: number;
  setdeliveryFee: (e: number) => void;
  sideBarToggle: (e: boolean) => void;
  openBargerMenu: boolean;
  bargerMenuToggle: (e: boolean) => void;
  openEmailForm: boolean;
  emailFormToggle: (e: boolean) => void;
  chageDeliveryType: (e: string) => void;
  couponDisc: couponType | undefined;
  setCouponDisc: (e: couponType) => void;
  deliveryDis: deliveryType | null;
  setdeliveryDis: (e: deliveryType | null) => void;
  showProductDetailM: boolean;
  setShowProductDetailM: (e: boolean) => void;
  baseProductId: string;
  setBaseProductId: (e: string) => void;
  adminSideBarToggle: boolean;
  setAdminSideBarToggleG: (e: boolean) => void;
  setCustomerEmailG: (e: string) => void;
  customerEmail: string;
  setCustomerData: (e: string) => void;
  customerData: string;
  
  setCustomerAddressIsComplete: (e: boolean) => void;
 
  customerAddressIsComplete: boolean;
  productCategoryIdG: string;
  setProductCategoryIdG: (e: string) => void;
  paymentType: string;
  setPaymentType: (e: string) => void;
  disablePickupCatDiscountIds: string[];
  setDisablePickupCatDiscountIds: (e: string[]) => void;
  settings: SettingsDataType;
};

const SiteContext = createContext<SiteContextType>({
  allProduct: [],
  setAllProduct: (e: ProductType[]) => e,
  productToSearchQuery: "",
setProductToSearchQuery: (e: string) => e,
  // handleSearchForm: (e: string) => {},
  // setHandleSearchForm: (fn: (e: string) => void) => {},
  paymentType: "",
  setPaymentType: (e: string) => {
    return e;
  },
  newOrderCondition: false,
  setNewOrderCondition: (e: boolean) => {
    return e;
  },
  deliveryFee: 0,
  setdeliveryFee: (e) => {
    return e;
  },
  open: false,
  deliveryType: "pickup",
  sideBarToggle: () => {},
  openBargerMenu: false,
  bargerMenuToggle: () => {},
  openEmailForm: false,
  emailFormToggle: (e) => {
    return e;
  },
  chageDeliveryType: (e) => {
    return e;
  },
  couponDisc: {
    couponDesc: "",
    isFeatured: false,
    minSpend: 0,
    code: "",
    discount: 0,
    productCat: "",
    isActivated: false,
    startDate: "",
    createdAt: undefined,
    date: "",
    message:"",
  },

  setCouponDisc: (e) => {
    return e;
  },
  deliveryDis: {
    id: "",
    name: "",
    deliveryFee: 0,
    minSpend: 0,
    note: "",
    productCat: "",
    //image: string;
    deliveryDistance: 0,
  },
  setdeliveryDis: (e) => {
    return e;
  },
  showProductDetailM: false,
  setShowProductDetailM: (e) => {
    return e;
  },
  baseProductId: "",
  setBaseProductId: (e) => {
    return e;
  },
  adminSideBarToggle: false,
  setAdminSideBarToggleG: (e) => {
    return e;
  },
  setCustomerEmailG: (e) => {
    return e;
  },
    setCustomerData: (e) => {
    return e;
  },
  customerEmail: "",
  setCustomerAddressIsComplete: (e) => {
    return e;
  },
    customerData: "",
  
  customerAddressIsComplete: false,
  productCategoryIdG: "",
  setProductCategoryIdG: (e) => {
    return e;
  },

  disablePickupCatDiscountIds: [],
  setDisablePickupCatDiscountIds: (e: string[]) => {
    return e;
  },

  settings: {},
});

export const UseSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartContextProvider");
  }
  return context;
};

export default SiteContext;
