const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

// ─── Auth Types ─────────────────────────────────────────────────────────────────

export type AuthUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
};

// ─── Product Types ──────────────────────────────────────────────────────────────

export type Product = {
    asin: string;
    title: string;
    priceValue: string;
    brandName: string;
    ratingStars: string;
    ratingCount: string;
    allImages: string[];
    favorite: boolean;
};

export type ProductDetail = Product & {
    aboutItem: string;
    availability: string;
    breadcrumbs: string;
    customerReviewSummary: string;
    deliveryDate: string;
    fastestDeliveryDate: string;
    sellerName: string;
    ratingDistribution1star: string;
    ratingDistribution2star: string;
    ratingDistribution3star: string;
    ratingDistribution4star: string;
    ratingDistribution5star: string;
};

// ─── Internal helpers ───────────────────────────────────────────────────────────

function getTokenFromStorage(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem("auth_user");
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AuthUser;
        return parsed?.token ?? null;
    } catch {
        return null;
    }
}

function authHeaders(): HeadersInit {
    const token = getTokenFromStorage();
    if (!token) return {};
    return {
        Authorization: `Bearer ${token}`,
    };
}

// ─── Product API ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/api/products`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

export async function getProduct(asin: string): Promise<ProductDetail> {
    const res = await fetch(`${BASE_URL}/api/products/${asin}`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Failed to fetch product ${asin}`);
    return res.json();
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export type CartProduct = {
    asin: string;
    title: string;
    priceValue: string;
    brandName: string;
    ratingStars: string;
    allImages: string[] | string; // backend bazen string array, bazen raw string gönderiyor
    images?: { id: number; imageUrl: string }[];
};

export type CartItem = {
    id: number;
    product: CartProduct;
    quantity: number;
};

export type Cart = {
    id: number;
    items: CartItem[];
    totalPrice: number;
    totalItems: number;
};

// ─── Cart API ─────────────────────────────────────────────────────────────────

export async function getCart(): Promise<Cart> {
    const res = await fetch(`${BASE_URL}/api/cart`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
}

export async function addToCart(asin: string, quantity = 1): Promise<Cart> {
    const res = await fetch(
        `${BASE_URL}/api/cart/add?asin=${encodeURIComponent(asin)}&quantity=${quantity}`,
        {
            method: "POST",
            headers: {
                ...authHeaders(),
            },
        }
    );
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
}

export async function updateCartItem(asin: string, quantity: number): Promise<Cart> {
    const res = await fetch(
        `${BASE_URL}/api/cart/update/${encodeURIComponent(asin)}?quantity=${quantity}`,
        {
            method: "PUT",
            headers: {
                ...authHeaders(),
            },
        }
    );
    if (!res.ok) throw new Error("Failed to update cart");
    return res.json();
}

export async function removeFromCart(asin: string): Promise<Cart> {
    const res = await fetch(
        `${BASE_URL}/api/cart/remove/${encodeURIComponent(asin)}`,
        {
            method: "DELETE",
            headers: {
                ...authHeaders(),
            },
        }
    );
    if (!res.ok) throw new Error("Failed to remove from cart");
    return res.json();
}

// ─── Review API ────────────────────────────────────────────────────────────────

export type ProductReview = {
    id: number;
    reviewTitle: string;
    reviewText: string;
    rating: string;
    verifiedPurchase: string;
    reviewMetadata: string;
};

export async function getProductReviews(asin: string): Promise<ProductReview[]> {
    const res = await fetch(`${BASE_URL}/api/products/${asin}/reviews`, {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch reviews");
    }
    return res.json();
}

// ─── Auth API ───────────────────────────────────────────────────────────────────

export async function login(input: {
    email: string;
    firstName: string;
    lastName: string;
    authProvider: string;
}): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        throw new Error("Failed to login");
    }
    return res.json();
}
