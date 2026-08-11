"use client";

import SiteContext from "./SiteContext";
import { useEffect, useState } from "react";
import { deliveryType } from "@/lib/types/deliveryType";
import { couponType } from "@/lib/types/couponType";
import { getAllSettings } from "@/app/(universal)/action/setting/dbOperations";
import { SettingsDataType } from "@/lib/types/settings";
import { ProductType } from "@/lib/types/productType";

interface Props {
  children: React.ReactNode;
}

export const SiteProvider: React.FC<Props> = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  //     const setcouponType ={
  //         couponDesc:{},
  // isFeatured:boolean,
  // minSpend:number,
  // name:string,
  // price:string,
  // productCat:string,
  // deliveryDis:{},
  // setdeliveryDis:(e)=>{return e}

  //  }

  const [open, setIsOpen] = useState<boolean>(false);
  const [openBargerMenu, setOpenBargerMenu] = useState<boolean>(false);
  const [openEmailForm, setEmailFormToggle] = useState<boolean>(false);
  const [customerEmail, setCustomerEmailL] = useState<string>("");
  const [customerAddressIsComplete, setCustomerAddressIsCompleteL] =
    useState(false);
  const [deliveryType, setDeliveryType] = useState<string>("pickup");
  const [couponDisc, setCouponDiscU] = useState<couponType | undefined>();
  const [deliveryDis, setdeliveryDisU] = useState<deliveryType | null>(null);
  const [showProductDetailM, setShowProductDetailML] = useState<boolean>(false);
  const [baseProductId, setBaseProductIdL] = useState<string>("");
  const [adminSideBarToggle, setAdminSideBarToggleL] = useState<boolean>(false);
  const [productCategoryIdG, setProductCategoryIdL] = useState<string>("");
  const [newOrderCondition, setNewOrderConditionL] = useState<boolean>(false);
  const [paymentType, setPaymentTypeL] = useState<string>("");
  const [deliveryFee, setdeliveryFeeL] = useState<number>(0);
  const [settings, setSettings] = useState<SettingsDataType>({});
  //const [disablePickupCatDiscountIds, setDisablePickupCatDiscountIdsL] = useState<string[] | null>(null);
  const [disablePickupCatDiscountIds, setDisablePickupCatDiscountIdsL] =
    useState<string[]>([]);
  const [allProduct, setAllProduct] = useState<ProductType[]>([]);
  const [productToSearchQuery, setProductToSearchQuery] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);

  const [customerAddressIsCompleteA, setCustomerAddressIsCompleteA] =
    useState<boolean>(false);
  // useEffect(() => {
  //   getAllSettings().then(setSettings).catch(console.error);
  // }, []);
  useEffect(() => {
    getAllSettings()
      .then((fetched) => {
        setSettings({
          // Default values from .env
          currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as string,
          locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE as string,

          // Now include everything from Firestore
          ...fetched,  // this overwrites defaults if Firestore has values
        });
      })
      .catch((err) => {
        console.error("Error fetching settings:", err);

        // Fallback to .env if Firestore fails
        setSettings({
          currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as string,
          locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE as string,
        });
      });
  }, []);



  useEffect(() => {
    const stored = localStorage.getItem("disablePickupCatDiscountIds");
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setDisablePickupCatDiscountIdsL(parsed);
      } else {
        setDisablePickupCatDiscountIdsL([]);
      }
    } catch {
      setDisablePickupCatDiscountIdsL([]);
    }
  }, []);

  useEffect(() => {
    const deliveryType = window.localStorage.getItem("delivery_type") as string;
    if (deliveryType !== undefined) {
      const deliveryTypeS = JSON.parse(deliveryType) as string;
      setDeliveryType(deliveryTypeS);
    }
    const customerEmail = window.localStorage.getItem(
      "customer_email"
    ) as string;
    if (customerEmail !== undefined) {
      const customerEmailS = JSON.parse(customerEmail) as string;
      setCustomerEmailL(customerEmailS);
    }
  }, []);

  function togleMenu() {
    setIsOpen(!open);
  }
  function bargerMenuToggle() {
    setOpenBargerMenu(!openBargerMenu);
  }
  function chageDeliveryType(t: string) {
    window.localStorage.setItem("delivery_type", JSON.stringify(t));
    setDeliveryType(t);
  }

  function setCouponDisc(e: couponType | undefined) {
    setCouponDiscU(e);
  }
  function setdeliveryDis(e: deliveryType | null) {
    setdeliveryDisU(e);
  }
  // deliveryDis:{},
  // setdeliveryDis:(e)=>{}

  // openEmailForm:false,
  function emailFormToggle(e: boolean) {
    setEmailFormToggle(e);
  }

  function setShowProductDetailM() {
    setShowProductDetailML(!showProductDetailM);
    //showProductDetailM,
  }

  function setBaseProductId(e: string) {
    setBaseProductIdL(e);
  }

  function setCustomerEmailG(e: string) {
    window.localStorage.setItem("customer_email", JSON.stringify(e));
    setCustomerEmailL(e);
  }
  function setCustomerAddressIsComplete(e: boolean) {
    setCustomerAddressIsCompleteL(e);
  }

  function setAdminSideBarToggleG(e: boolean) {
    setAdminSideBarToggleL(e);
  }

  function setProductCategoryIdG(id: string) {
    setProductCategoryIdL(id);
  }
  function setNewOrderCondition(s: boolean) {
    setNewOrderConditionL(s);
  }

  function setPaymentType(s: string) {
    setPaymentTypeL(s);
  }

  function setdeliveryFee(e: number) {
    setdeliveryFeeL(e);
  }
  function setDisablePickupCatDiscountIds(CatIds: string[]) {
    setDisablePickupCatDiscountIdsL(CatIds);
    localStorage.setItem("disablePickupCatDiscountIds", JSON.stringify(CatIds));
  }

  function setCustomer(data: any) {
    setCustomerData(data);
  }

 
  return (
    <SiteContext.Provider
      value={{
        allProduct,
        setAllProduct,
        //     handleSearchForm,
        // setHandleSearchForm,
        productToSearchQuery,
        setProductToSearchQuery,
        paymentType,
        setPaymentType,
        newOrderCondition,
        setNewOrderCondition,
        open,
        openBargerMenu,
        sideBarToggle: togleMenu,
        bargerMenuToggle,
        openEmailForm,
        emailFormToggle,
        deliveryType,
        chageDeliveryType,
        deliveryFee,
        setdeliveryFee,
        couponDisc,
        setCouponDisc,
        deliveryDis,
        setdeliveryDis,
        showProductDetailM,
        setShowProductDetailM,
        baseProductId,
        setBaseProductId,
        adminSideBarToggle,
        setAdminSideBarToggleG,
        setCustomerEmailG,
        customerEmail,
        customerData,
        setCustomerData,
        setCustomerAddressIsComplete,
        customerAddressIsComplete,
        setProductCategoryIdG,
        productCategoryIdG,
        disablePickupCatDiscountIds,
        setDisablePickupCatDiscountIds,
        settings,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
