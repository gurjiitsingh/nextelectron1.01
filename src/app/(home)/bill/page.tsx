
import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
import CartPanel from "@/components/pos/cart/CartPanel";

import Products from "@/components/level-1/Products";
import PosTopBar from "@/components/pos/home/PosTopBar";
import Billing from "./Billing";

export default async function Page() {
  return (<Billing  tableNo={"T1"} />);
}