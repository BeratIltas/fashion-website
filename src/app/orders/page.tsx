"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { getMyOrders, Order } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";

function safePriceNumber(priceValue: unknown): number {
    if (typeof priceValue === "number" && Number.isFinite(priceValue)) return priceValue;
    if (typeof priceValue === "string") {
        const cleaned = priceValue.replace(/[^0-9.,-]/g, "").replace(",", ".");
        const n = Number.parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await getMyOrders();
                // Sort by orderDate descending
                const sorted = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                setOrders(sorted);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [user]);

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />
                </div>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container>
                <div className="py-20 text-center">
                    <h1 className="text-2xl font-bold">Please log in</h1>
                    <p className="mt-2 text-neutral-600 mb-6">You need to be logged in to view your orders.</p>
                    <Link href="/login">
                        <Button>Log in</Button>
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="py-20">
                <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
                        <div className="text-lg font-medium text-neutral-900">No orders yet</div>
                        <p className="mt-2 text-neutral-500 mb-6">You haven't placed any orders.</p>
                        <Link href="/shop">
                            <Button>Start Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
                                <div className="bg-neutral-50 p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full text-sm">
                                        <div>
                                            <div className="text-neutral-500 mb-1">Order Placed</div>
                                            <div className="font-medium text-neutral-900">
                                                {new Date(order.orderDate).toLocaleDateString("tr-TR", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 mb-1">Total Amount</div>
                                            <div className="font-medium text-neutral-900">${order.totalAmount.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 mb-1">Status</div>
                                            <div className="font-medium capitalize text-neutral-900">{order.status}</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 mb-1">Order #</div>
                                            <div className="font-medium text-neutral-900">{order.id}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 divide-y divide-neutral-100">
                                    {order.items.map((item) => {
                                        const price = item.priceAtPurchase || safePriceNumber(item.product.priceValue);
                                        let imageSrc = "/placeholder.png";
                                        if (item.product.allImages) {
                                            const images = typeof item.product.allImages === "string"
                                                ? [item.product.allImages]
                                                : item.product.allImages;
                                            if (images.length > 0) imageSrc = images[0];
                                        }

                                        // Handle json string images if backend returned it raw
                                        if (imageSrc.startsWith("[")) {
                                            try {
                                                const parsed = JSON.parse(imageSrc.replace(/'/g, '"'));
                                                if (Array.isArray(parsed) && parsed.length > 0) imageSrc = parsed[0];
                                            } catch (e) { }
                                        }

                                        return (
                                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-6">
                                                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                                                    <Image
                                                        src={imageSrc}
                                                        alt={item.product.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="96px"
                                                        unoptimized={imageSrc.includes('amazon.com')}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/placeholder.png";
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="font-medium text-neutral-900 mb-1">
                                                        {item.product.title}
                                                    </div>
                                                    <div className="text-sm text-neutral-500 mb-2">
                                                        {item.product.brandName}
                                                    </div>
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {item.quantity} × ${price.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="hidden sm:flex items-center">
                                                    <Link href={`/product/${item.product.asin}`}>
                                                        <Button variant="secondary" className="text-sm px-4 py-2">
                                                            View Product
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
