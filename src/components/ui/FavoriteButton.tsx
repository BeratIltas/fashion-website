"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFavorites, toggleFavorite } from "@/lib/api";
import { Heart } from "lucide-react";

type Props = {
    asin: string;
    initialFavorite: boolean;
    className?: string;
};

let favoriteSetCache: Set<string> | null = null;
let favoriteSetPromise: Promise<Set<string>> | null = null;
const favoriteSubscribers = new Set<(favorites: Set<string>) => void>();

function notifyFavoriteSubscribers(favorites: Set<string>) {
    favoriteSubscribers.forEach((listener) => listener(new Set(favorites)));
}

async function loadFavoriteSet(): Promise<Set<string>> {
    if (favoriteSetCache) {
        return favoriteSetCache;
    }

    if (!favoriteSetPromise) {
        favoriteSetPromise = getFavorites()
            .then((items) => {
                favoriteSetCache = new Set(items.map((item) => item.productAsin));
                return favoriteSetCache;
            })
            .finally(() => {
                favoriteSetPromise = null;
            });
    }

    return favoriteSetPromise;
}

export default function FavoriteButton({ asin, initialFavorite, className = "" }: Props) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsFavorite(initialFavorite);
    }, [initialFavorite]);

    useEffect(() => {
        if (!mounted || !user) {
            return;
        }

        const handleFavoritesChange = (favorites: Set<string>) => {
            setIsFavorite(favorites.has(asin));
        };

        favoriteSubscribers.add(handleFavoritesChange);

        void loadFavoriteSet()
            .then((favorites) => {
                handleFavoritesChange(favorites);
            })
            .catch((error) => {
                console.error("Failed to load favorite state", error);
            });

        return () => {
            favoriteSubscribers.delete(handleFavoritesChange);
        };
    }, [asin, mounted, user]);

    useEffect(() => {
        if (user) return;

        favoriteSetCache = null;
        favoriteSetPromise = null;
        setIsFavorite(initialFavorite);
    }, [initialFavorite, user]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Please log in to add favorites.");
            return;
        }

        setLoading(true);
        const nextValue = !isFavorite;
        try {
            setIsFavorite(nextValue);

            const btn = e.currentTarget as HTMLButtonElement;
            btn.classList.remove("scale-100", "scale-110");
            btn.classList.add("scale-125");
            setTimeout(() => {
                btn.classList.remove("scale-125");
                btn.classList.add("scale-110");
            }, 150);

            await toggleFavorite(asin);

            const nextFavorites = new Set(favoriteSetCache ?? []);
            if (nextValue) {
                nextFavorites.add(asin);
            } else {
                nextFavorites.delete(asin);
            }

            favoriteSetCache = nextFavorites;
            notifyFavoriteSubscribers(nextFavorites);
        } catch (error) {
            console.error(error);
            setIsFavorite(!nextValue);
            alert("Failed to update favorite status.");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <button
                disabled
                className={`flex items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all duration-200 outline-none ${initialFavorite ? "text-red-500 shadow-sm" : "text-neutral-400"} ${className}`}
            >
                <Heart size={16} className={initialFavorite ? "fill-current" : ""} />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all duration-200 outline-none hover:scale-110 active:scale-95 ${isFavorite ? "text-red-500 shadow-sm" : "text-neutral-400"
                } ${className}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart size={16} className={isFavorite ? "fill-current" : ""} />
        </button>
    );
}
