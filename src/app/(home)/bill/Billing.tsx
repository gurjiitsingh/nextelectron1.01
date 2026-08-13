
'use client';

import React, { useEffect, useMemo, useState } from 'react';

type PaymentMode =
    | 'CASH'
    | 'CARD'
    | 'UPI'
    | 'WALLET'
    | 'CREDIT';

type OrderType =
    | 'DINE_IN'
    | 'TAKEAWAY'
    | 'DELIVERY';

type KitchenItem = {
    id: string;
    kotNumber: string;
    categoryName?: string;
    productMode?: string;
    currentStock?: number;

    sessionId?: string;
    kotBatchId?: string;

    tableNo?: string;
    tableName?: string;

    productId: string;
    name: string;
    categoryId: string;

    createdById?: string;
    createdByName?: string;

    parentId?: string | null;
    isVariant?: boolean;

    basePrice: number;
    finalPrice: number;
    modifierTotal?: number;
    quantity: number;

    taxRate?: number;
    taxType?: string;

    status?: string;
    note?: string;
    modifiersJson?: string;

    kitchenPrintReq?: number | boolean;
    kitchenPrinted?: number | boolean;

    createdAt: number;
};

type Payment = {
    id: string;
    mode: PaymentMode;
    amount: number;
};

type BillingProps = {
    tableNo: string;
    orderType?: OrderType;
    onClose?: () => void;
    onSuccess?: () => void;
};

export default function Billing({
    tableNo,
    orderType = 'DINE_IN',
    onClose,
    onSuccess,
}: BillingProps) {
    const [items, setItems] = useState<KitchenItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [customerName, setCustomerName] =
        useState('Customer');

    const [customerPhone, setCustomerPhone] =
        useState('');

    const [discount, setDiscount] =
        useState(0);

    const [deliveryFee, setDeliveryFee] =
        useState(0);

    const [paymentMode, setPaymentMode] =
        useState<PaymentMode>('CASH');

    const [paidAmount, setPaidAmount] =
        useState(0);

    const [error, setError] =
        useState<string | null>(null);

    // =====================================================
    // LOAD KITCHEN ITEMS
    // =====================================================

    useEffect(() => {
        loadItems();
    }, [tableNo]);

    async function loadItems() {
        if (!tableNo) return;

        try {
            setLoading(true);
            setError(null);

            const rows =
                await window.posApi.getPendingKotByTable(
                    tableNo
                );

            setItems(rows as KitchenItem[]);
        } catch (e: any) {
            console.error(
                'Failed to load billing items',
                e
            );

            setError(
                e?.message ||
                'Failed to load kitchen items'
            );
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // GROUP KITCHEN ITEMS
    // =====================================================

    const billItems = useMemo(() => {
        const map = new Map<
            string,
            KitchenItem
        >();

        for (const item of items) {
            const key = [
                item.productId,
                item.basePrice,
                item.taxRate ?? 0,
                item.taxType ?? 'exclusive',
                item.note ?? '',
                item.modifiersJson ?? '',
            ].join('|');

            const existing = map.get(key);

            if (existing) {
                existing.quantity += Number(
                    item.quantity || 0
                );
            } else {
                map.set(key, {
                    ...item,
                    quantity: Number(
                        item.quantity || 0
                    ),
                });
            }
        }

        return Array.from(map.values());
    }, [items]);

    // =====================================================
    // BILL CALCULATION
    // =====================================================

    const calculation = useMemo(() => {
        let itemSubtotal = 0;
        let itemTax = 0;

        for (const item of billItems) {
            const quantity =
                Number(item.quantity) || 0;

            const basePrice =
                Number(item.basePrice) || 0;

            const modifierPrice =
                Number(item.modifierTotal) || 0;

            const price =
                basePrice + modifierPrice;

            const subtotal =
                price * quantity;

            itemSubtotal += subtotal;

            const taxRate =
                Number(item.taxRate) || 0;

            const taxType =
                item.taxType || 'exclusive';

            if (taxType === 'exclusive') {
                itemTax +=
                    subtotal *
                    (taxRate / 100);
            }
        }

        const safeDiscount =
            Math.max(
                0,
                Math.min(
                    Number(discount) || 0,
                    itemSubtotal + itemTax
                )
            );

        const safeDeliveryFee =
            Math.max(
                0,
                Number(deliveryFee) || 0
            );

        const taxableAfterDiscount =
            Math.max(
                0,
                itemSubtotal +
                itemTax -
                safeDiscount
            );

        const grandTotal =
            taxableAfterDiscount +
            safeDeliveryFee;

        return {
            itemSubtotal:
                Number(
                    itemSubtotal.toFixed(2)
                ),

            itemTax:
                Number(
                    itemTax.toFixed(2)
                ),

            discount:
                Number(
                    safeDiscount.toFixed(2)
                ),

            deliveryFee:
                Number(
                    safeDeliveryFee.toFixed(2)
                ),

            grandTotal:
                Number(
                    grandTotal.toFixed(2)
                ),
        };
    }, [
        billItems,
        discount,
        deliveryFee,
    ]);

    // =====================================================
    // PAYMENT
    // =====================================================

    const dueAmount = Math.max(
        0,
        calculation.grandTotal -
        Number(paidAmount || 0)
    );

    const paymentStatus =
        paymentMode === 'CREDIT'
            ? 'CREDIT'
            : dueAmount > 0
                ? 'PARTIAL'
                : 'PAID';

    // =====================================================
    // FINALIZE BILL
    // =====================================================

    async function handleCheckout() {
        if (processing) return;

        if (billItems.length === 0) {
            setError(
                'No kitchen items available for billing.'
            );
            return;
        }

        if (
            (paymentStatus === 'CREDIT' ||
                paymentStatus === 'PARTIAL') &&
            !customerPhone.trim()
        ) {
            setError(
                'Phone number is required for credit sale.'
            );
            return;
        }

        if (
            Number(paidAmount) >
            calculation.grandTotal
        ) {
            setError(
                'Paid amount cannot be greater than total.'
            );
            return;
        }

        try {
            setProcessing(true);
            setError(null);

            /*
             * FINAL BILL IPC WILL BE CONNECTED HERE.
             *
             * This will eventually call something like:
             *
             * window.posApi.createBill({
             *   tableNo,
             *   orderType,
             *   customerName,
             *   customerPhone,
             *   items: billItems,
             *   itemTotal: calculation.itemSubtotal,
             *   itemTax: calculation.itemTax,
             *   discountTotal: calculation.discount,
             *   deliveryFee: calculation.deliveryFee,
             *   grandTotal: calculation.grandTotal,
             *   paymentMode,
             *   paymentStatus,
             *   paidAmount,
             *   dueAmount,
             * });
             *
             * We will implement this after creating
             * the Electron billing repository/IPC.
             */

            const result =
                await window.posApi.createBill({
                    tableNo,

                    orderType,

                    customerName:
                        customerName.trim() ||
                        'Customer',

                    customerPhone:
                        customerPhone.trim(),

                    discountTotal:
                        calculation.discount,

                    deliveryFee:
                        calculation.deliveryFee,

                    deliveryTax: 0,

                    paymentMode,

                    paymentStatus,

                    paidAmount:
                        Number(paidAmount) || 0,

                    payments:
                        paidAmount > 0
                            ? [
                                {
                                    mode: paymentMode,
                                    amount:
                                        Number(paidAmount),
                                },
                            ]
                            : [],

                    deviceId: 'POS',
                    deviceName: 'Electron POS',
                    appVersion: '1.0',

                    businessDate:
                        new Date()
                            .toISOString()
                            .slice(0, 10),

                    currency: '₹',
                });


            if (!result.success) {
                throw new Error(
                    result.error ||
                    'Failed to create bill'
                );
            }


            console.log(
                'BILL CREATED',
                result
            );


            alert(
                `Bill ${result.srno} created successfully`
            );


            onSuccess?.();
        } catch (e: any) {
            console.error(
                'BILL FAILED',
                e
            );

            setError(
                e?.message ||
                'Payment failed'
            );
        } finally {
            setProcessing(false);
        }
    }

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading bill...
                </p>
            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto bg-white">

            {/* =================================================
          HEADER
      ================================================= */}

            <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">

                <div>
                    <h2 className="text-base font-semibold text-gray-900">
                        Bill
                    </h2>

                    <p className="text-xs text-gray-500">
                        Table: {tableNo}
                    </p>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                        Back
                    </button>
                )}
            </div>

            {/* =================================================
          CONTENT
      ================================================= */}

            <div className="min-h-0 flex-1 ">

                {/* CUSTOMER */}
                <div className='flex '>

                    <div>
                     
                        {/* ITEMS */}

                        <div className="border-b overflow-y-auto max-h-[500px]">

                            <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
                                <p className="text-xs font-semibold text-gray-700">
                                    Items
                                </p>

                                <p className="text-xs text-gray-500">
                                    {billItems.length} lines
                                </p>
                            </div>

                            {billItems.map((item) => {

                                const quantity =
                                    Number(item.quantity) || 0;

                                const modifier =
                                    Number(
                                        item.modifierTotal
                                    ) || 0;

                                const unitPrice =
                                    Number(
                                        item.basePrice
                                    ) + modifier;

                                const total =
                                    unitPrice * quantity;

                                return (
                                    <div
                                        key={item.id}
                                        className="border-t px-4 py-2   overflow-y-auto"
                                    >

                                        <div className="flex items-center justify-between gap-3">

                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-xs font-medium text-gray-900">
                                                    {item.name}
                                                </p>

                                                {item.note && (
                                                    <p className="truncate text-[10px] text-gray-500">
                                                        {item.note}
                                                    </p>
                                                )}

                                            </div>

                                            <div className="shrink-0 text-right">

                                                <p className="text-[10px] text-gray-500">
                                                    {quantity} × ₹
                                                    {unitPrice.toFixed(2)}
                                                </p>

                                                <p className="text-xs font-semibold text-gray-900">
                                                    ₹{total.toFixed(2)}
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                           <div className="border-b px-4 py-3">

                            <p className="mb-2 text-xs font-semibold text-gray-700">
                                Customer
                            </p>

                            <div className="grid grid-cols-2 gap-2">

                                <input
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Customer name"
                                    className="h-9 border px-2 text-xs outline-none focus:border-blue-500"
                                />

                                <input
                                    value={customerPhone}
                                    onChange={(e) =>
                                        setCustomerPhone(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Phone"
                                    inputMode="tel"
                                    className="h-9 border px-2 text-xs outline-none focus:border-blue-500"
                                />

                            </div>
                        </div>

                        {/* DISCOUNT / DELIVERY */}

                        <div className="grid grid-cols-2 gap-3 border-b px-4 py-3">

                            <div>
                                <label className="mb-1 block text-[10px] text-gray-500">
                                    Discount
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={discount}
                                    onChange={(e) =>
                                        setDiscount(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="h-8 w-full border px-2 text-xs outline-none focus:border-blue-500"
                                />
                            </div>

                            {orderType === 'DELIVERY' && (
                                <div>
                                    <label className="mb-1 block text-[10px] text-gray-500">
                                        Delivery Fee
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={deliveryFee}
                                        onChange={(e) =>
                                            setDeliveryFee(
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                        className="h-8 w-full border px-2 text-xs outline-none focus:border-blue-500"
                                    />
                                </div>
                            )}

                        </div>

                        {/* PAYMENT */}

                        <div className="border-b px-4 py-3">

                            <p className="mb-2 text-xs font-semibold text-gray-700">
                                Payment
                            </p>

                            <div className="grid grid-cols-5 gap-1">

                                {(
                                    [
                                        'CASH',
                                        'CARD',
                                        'UPI',
                                        'WALLET',
                                        'CREDIT',
                                    ] as PaymentMode[]
                                ).map((mode) => (

                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => {
                                            setPaymentMode(mode);

                                            if (mode === 'CREDIT') {
                                                setPaidAmount(0);
                                            }
                                        }}
                                        className={`h-8 text-[10px] font-semibold ${paymentMode === mode
                                                ? 'bg-blue-600 text-white'
                                                : 'border bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {mode}
                                    </button>

                                ))}

                            </div>

                            {paymentMode !== 'CREDIT' && (
                                <div className="mt-3">

                                    <label className="mb-1 block text-[10px] text-gray-500">
                                        Paid Amount
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={paidAmount}
                                        onChange={(e) =>
                                            setPaidAmount(
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                        className="h-9 w-full border px-2 text-xs outline-none focus:border-blue-500"
                                    />

                                </div>
                            )}

                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="mx-4 mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">
                                {error}
                            </div>
                        )}

                    </div>

                    {/* =================================================
          FOOTER
      ================================================= */}

                    <div className="shrink-0 border-t bg-gray-50 px-4 py-3">

                        <div className="space-y-1 text-xs">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Item Total
                                </span>

                                <span>
                                    ₹
                                    {calculation.itemSubtotal.toFixed(
                                        2
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Tax
                                </span>

                                <span>
                                    ₹
                                    {calculation.itemTax.toFixed(
                                        2
                                    )}
                                </span>
                            </div>

                            {calculation.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>
                                        Discount
                                    </span>

                                    <span>
                                        -₹
                                        {calculation.discount.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            )}

                            {calculation.deliveryFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Delivery
                                    </span>

                                    <span>
                                        ₹
                                        {calculation.deliveryFee.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
                                <span>
                                    Grand Total
                                </span>

                                <span>
                                    ₹
                                    {calculation.grandTotal.toFixed(
                                        2
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between text-xs">

                                <span className="text-gray-500">
                                    Paid
                                </span>

                                <span>
                                    ₹
                                    {Number(
                                        paidAmount || 0
                                    ).toFixed(2)}
                                </span>

                            </div>

                            <div className="flex justify-between font-semibold">

                                <span
                                    className={
                                        dueAmount > 0
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                    }
                                >
                                    Due
                                </span>

                                <span
                                    className={
                                        dueAmount > 0
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                    }
                                >
                                    ₹{dueAmount.toFixed(2)}
                                </span>

                            </div>

                        </div>

                        <button
                            type="button"
                            disabled={
                                processing ||
                                billItems.length === 0
                            }
                            onClick={handleCheckout}
                            className={`mt-3 h-10 w-full text-sm font-semibold text-white ${processing ||
                                    billItems.length === 0
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {processing
                                ? 'PROCESSING...'
                                : `PAY ₹${calculation.grandTotal.toFixed(2)}`}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

