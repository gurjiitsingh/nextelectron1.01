"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import POSTableRow from "@/components/pos/orders/POSTableRow";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { fetchOrdersPaginated } from "@/app/(universal)/action/orders/dbOperations";

const ORDERS_PER_PAGE = 10; // POS needs bigger pagination

export default function POSOrdersListView() {
  const [orders, setOrders] = useState<orderMasterDataT[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [afterStack, setAfterStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (next = false, back = false) => {
    setLoading(true);

    let afterId: string | undefined = undefined;
    let newStack = [...afterStack];

    if (next && lastId) {
      newStack.push(lastId);
      afterId = lastId;
      setPageIndex((p) => p + 1);
    } else if (back && newStack.length > 0) {
      newStack.pop();
      afterId = newStack[newStack.length - 1];
      setPageIndex((p) => p - 1);
    } else {
      setPageIndex(0);
    }

    setAfterStack(newStack);

    const { orders, lastId: newLastId } = await fetchOrdersPaginated({
      afterId,
      pageSize: ORDERS_PER_PAGE,
    });

    setOrders(orders);
    setLastId(newLastId);
    setLoading(false);
  };

  return (
    <div className="mt-2 p-2">
      <div className="overflow-x-auto bg-white shadow rounded-xl border border-gray-200">
        <Table className="min-w-[800px] text-sm text-gray-700">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Time</TableHead>
               <TableHead>Delivery/Picup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              {/* <TableHead>Print</TableHead> */}
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <td colSpan={8} className="text-center py-4">
                  Loading...
                </td>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <td colSpan={8} className="text-center py-4">
                  No orders found
                </td>
              </TableRow>
            ) : (
              orders.map((order) => (
                <POSTableRow key={order.id} order={order} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => loadOrders(false, true)}
          disabled={pageIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          ⬅️ Newer
        </button>

        <button
          onClick={() => loadOrders(true, false)}
          disabled={orders.length < ORDERS_PER_PAGE}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Older ➡️
        </button>
      </div>
    </div>
  );
}
