"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getFavorites, FavoriteItem } from "@/lib/api";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";

export default function FavoritesPage() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFavorites() {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFavorites();
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
                    <p className="mt-2 text-neutral-600 mb-6">You need to be logged in to view your favorites.</p>
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
                <h1 className="text-3xl font-bold tracking-tight mb-8">My Favorites</h1>

                {favorites.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
                        <div className="text-lg font-medium text-neutral-900">No favorites yet</div>
                        <p className="mt-2 text-neutral-500 mb-6">You haven't saved any items to your favorites.</p>
                        <Link href="/shop">
                            <Button>Start Browsing</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {favorites.map((p) => {
                            // Ensure we display an image properly
                            let imageSrc = "/placeholder.png";
                            if (p.imageUrl) {
                                imageSrc = p.imageUrl;
                            }
                            // Handle json string images if backend returned it raw
                            if (imageSrc.startsWith("[")) {
                                try {
                                    const parsed = JSON.parse(imageSrc.replace(/'/g, '"'));
                                    if (Array.isArray(parsed) && parsed.length > 0) imageSrc = parsed[0];
                                } catch (e) { }
                            }

                            return (
                                <div
                                    key={p.favoriteId}
                                    className="group relative rounded-3xl border border-neutral-200/70 bg-white p-3 transition hover:border-neutral-300 flex flex-col items-center"
                                >
                                    <FavoriteButton
                                        asin={p.productAsin}
                                        initialFavorite={true}
                                        className="absolute right-3 top-3 z-10 h-8 w-8"
                                    />
                                    <Link href={`/product/${p.productAsin}`} className="w-full relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 flex-shrink-0">
                                        <Image
                                            src={imageSrc}
                                            alt={p.title}
                                            fill
                                            className="object-cover transition group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            unoptimized={imageSrc.includes('amazon.com')}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.png";
                                            }}
                                        />
                                    </Link>

                                    <div className="mt-3 w-full flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="line-clamp-2 text-sm font-medium">{p.title}</div>
                                            <div className="mt-1 text-sm font-semibold">${parseFloat(p.priceValue).toFixed(2)}</div>
                                        </div>

                                        <div className="mt-3">
                                            <AddToCartButton asin={p.productAsin} label="Add to Cart" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Container>
    );
}
