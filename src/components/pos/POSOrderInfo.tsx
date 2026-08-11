import { useCartContext } from "@/store/CartContext";
type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export default function POSOrderInfo() {
    
    const { orderType, setOrderType, tableNo, setTableNo } = useCartContext();
  return (
    <div className="flex items-center gap-3">
    <select
  value={orderType}
  onChange={(e) => {
    const value = e.target.value as OrderType;
    setOrderType(value);

    if (value !== "DINE_IN") {
      setTableNo(null);
    }
  }}
>
  <option value="DINE_IN">Dine In</option>
  <option value="TAKEAWAY">Takeaway</option>
  <option value="DELIVERY">Delivery</option>
</select>

         <input
        className="border border-gray-100 px-2 py-1 rounded w-24"
        value={tableNo ?? ""}
        onChange={(e) => setTableNo(e.target.value)}
        placeholder="Table No"
      />






    </div>
  );
}
