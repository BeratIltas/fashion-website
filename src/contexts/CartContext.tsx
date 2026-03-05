"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
    Cart,
    addToCart as apiAdd,
    getCart as apiGet,
    removeFromCart as apiRemove,
    updateCartItem as apiUpdate,
} from "@/lib/api";

type CartContextValue = {
    cart: Cart | null;
    loading: boolean;
    addItem: (asin: string, quantity?: number) => Promise<void>;
    updateItem: (asin: string, quantity: number) => Promise<void>;
    removeItem: (asin: string) => Promise<void>;
    refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const data = await apiGet();
            setCart(data);
        } catch {
            // backend unreachable — keep existing state
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addItem = useCallback(async (asin: string, quantity = 1) => {
        setLoading(true);
        try {
            const data = await apiAdd(asin, quantity);
            setCart(data);
        } catch (error) {
            console.error("Failed to add item to cart", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateItem = useCallback(async (asin: string, quantity: number) => {
        setLoading(true);
        try {
            const data = await apiUpdate(asin, quantity);
            setCart(data);
        } catch (error) {
            console.error("Failed to update cart item", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const removeItem = useCallback(async (asin: string) => {
        setLoading(true);
        try {
            const data = await apiRemove(asin);
            setCart(data);
        } catch (error) {
            console.error("Failed to remove cart item", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, refresh }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}
