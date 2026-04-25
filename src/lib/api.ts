const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

// ─── Auth Types ─────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN" | "SELLER";

export type AuthUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    role?: UserRole;
    authProvider?: string;
    identityProvider?: string;
    firebaseUid?: string;
    avatarUrl?: string;
};

export type UserProfile = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    photoURL: string;
};

export type PublicAnnouncement = {
    id: number;
    message: string;
    createdAt: string;
    active: boolean;
};

export type ContactMessageRequest = {
    fullName: string;
    email: string;
    subject: string;
    message: string;
};

export type ContactMessageResponse = ContactMessageRequest & {
    id: number;
    createdAt: string;
    read: boolean;
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
    defaultVariant0?: string;
    defaultVariant1?: string;
    favorite: boolean;
};

export type ProductDetail = Product & {
    aboutItem: string;
    availability: string;
    breadcrumbs: string;
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

export type ProductsQuery = {
    page?: number;
    size?: number;
};

export type ProductFilters = {
    mainCategory?: string;
    subCategory?: string;
    brand?: string;
    color?: string;
    size?: string;
    minRating?: string;
};

async function readProductsResponse(
    res: Response,
    fallbackMessage: string,
    query: ProductsQuery
): Promise<Product[]> {
    if (res.ok) {
        return res.json();
    }

    if ((query.page ?? 0) > 0) {
        return [];
    }

    throw new Error(fallbackMessage);
}

export async function searchProducts(
    q: string,
    query: ProductsQuery = {}
): Promise<Product[]> {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("page", String(query.page ?? 0));
    params.set("size", String(query.size ?? 50));

    const res = await fetch(`${BASE_URL}/api/products/search?${params.toString()}`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
    });
    return readProductsResponse(res, "Failed to search products", query);
}

export async function filterProducts(
    filters: ProductFilters,
    query: ProductsQuery = {}
): Promise<Product[]> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
        if (value?.trim()) {
            params.set(key, value.trim());
        }
    }

    params.set("page", String(query.page ?? 0));
    params.set("pageSize", String(query.size ?? 50));

    const res = await fetch(`${BASE_URL}/api/products/filter?${params.toString()}`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
    });

    return readProductsResponse(res, "Failed to filter products", query);
}

export async function getProduct(asin: string): Promise<ProductDetail> {
    const res = await fetch(`${BASE_URL}/api/products/${asin}`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
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
    discountedPrice?: number;
};

export type Cart = {
    id: number;
    appliedCouponCode?: string;
    items: CartItem[];
    originalTotalPrice?: number;
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

export async function addToCart(asin: string, quantity = 1): Promise<Cart | null> {
    try {
        const res = await fetch(
            `${BASE_URL}/api/cart/add?asin=${encodeURIComponent(asin)}&quantity=${quantity}`,
            {
                method: "POST",
                headers: {
                    ...authHeaders(),
                },
            }
        );
        if (!res.ok) {
            console.error("addToCart request failed", res.status);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("addToCart network error", error);
        return null;
    }
}

export async function updateCartItem(asin: string, quantity: number): Promise<Cart | null> {
    try {
        const res = await fetch(
            `${BASE_URL}/api/cart/update/${encodeURIComponent(asin)}?quantity=${quantity}`,
            {
                method: "PUT",
                headers: {
                    ...authHeaders(),
                },
            }
        );
        if (!res.ok) {
            console.error("updateCartItem request failed", res.status);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("updateCartItem network error", error);
        return null;
    }
}

export async function removeFromCart(asin: string): Promise<Cart | null> {
    try {
        const res = await fetch(
            `${BASE_URL}/api/cart/remove/${encodeURIComponent(asin)}`,
            {
                method: "DELETE",
                headers: {
                    ...authHeaders(),
                },
            }
        );
        if (!res.ok) {
            console.error("removeFromCart request failed", res.status);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("removeFromCart network error", error);
        return null;
    }
}

// ─── Review API ────────────────────────────────────────────────────────────────

export type ProductReview = {
    id: number;
    reviewTitle: string;
    reviewText: string;
    rating: string;
    verifiedPurchase: string;
    reviewMetadata: string;
    userName?: string;
    createdByCurrentUser?: boolean;
};

export type ReviewSubmitRequest = {
    reviewTitle: string;
    reviewText: string;
    rating: number;
};

export async function getProductReviews(asin: string): Promise<ProductReview[]> {
    const res = await fetch(`${BASE_URL}/api/products/${asin}/reviews`, {
        cache: "no-store",
        headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
}

export async function getProductAiSummary(asin: string): Promise<string> {
    try {
        const res = await fetch(`${BASE_URL}/api/products/asin/${asin}/ai-summary`, {
            cache: "no-store",
        });
        if (!res.ok) return "";
        const data = await res.json() as { status?: string; summary?: string };
        return data?.summary ?? "";
    } catch {
        return "";
    }
}

export async function submitProductReview(asin: string, data: ReviewSubmitRequest): Promise<ProductReview> {
    const res = await fetch(`${BASE_URL}/api/products/${asin}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        let errBody = "";
        try { errBody = await res.text(); } catch { /* ignore */ }
        console.error("submitProductReview failed", res.status, errBody);
        throw new Error(`[${res.status}] ${errBody || "Failed to submit review"}`);
    }
    return res.json();
}

export async function generateCoupon(): Promise<{ status: string; code: string; message: string }> {
    const res = await fetch(`${BASE_URL}/api/discounts/generate`, {
        method: "POST",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to generate coupon");
    return res.json();
}

export async function applyCoupon(code: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/discounts/apply?code=${encodeURIComponent(code)}`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Invalid or expired coupon");
}

export async function getPublicAnnouncements(): Promise<PublicAnnouncement[]> {
    const res = await fetch(`${BASE_URL}/api/public/announcements`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch announcements");
    }

    return res.json();
}

export async function sendContactMessage(input: ContactMessageRequest): Promise<ContactMessageResponse> {
    const res = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, "Failed to send message"));
    }

    return res.json();
}

// ─── Auth API ───────────────────────────────────────────────────────────────────

async function readApiErrorMessage(res: Response, fallbackMessage: string): Promise<string> {
    try {
        const data = await res.json();
        if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
            return data.message;
        }
    } catch {
        // ignore JSON parse failures
    }

    try {
        const text = await res.text();
        if (text.trim()) return text;
    } catch {
        // ignore text parse failures
    }

    return fallbackMessage;
}

export type AuthRequest = {
    email: string;
    firstName: string;
    lastName: string;
    authProvider: string;
    identityProvider?: string;
    firebaseUid?: string;
    firebaseIdToken?: string;
    avatarUrl?: string;
    isNewUser?: boolean;
};

export async function login(input: AuthRequest): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, "Authentication failed"));
    }
    return res.json();
}

export async function getUserProfile(): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, "Failed to fetch profile"));
    }

    return res.json();
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
        },
        body: JSON.stringify(profile),
    });

    if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, "Failed to update profile"));
    }

    return res.json();
}

export async function uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/api/users/profile-image`, {
        method: "POST",
        headers: {
            ...authHeaders(),
        },
        body: formData,
    });

    if (!res.ok) {
        throw new Error(await readApiErrorMessage(res, "Failed to upload profile image"));
    }

    const uploadedUrl = (await res.text()).trim().replace(/^"|"$/g, "");
    return uploadedUrl.startsWith("/") ? `${BASE_URL}${uploadedUrl}` : uploadedUrl;
}

// ─── Order API ──────────────────────────────────────────────────────────────────

export type OrderItem = {
    id: number;
    product: ProductDetail;
    quantity: number;
    priceAtPurchase: number;
};

export type Order = {
    id: number;
    user: AuthUser;
    orderDate: string;
    totalAmount: number;
    status: string;
    items: OrderItem[];
};

export async function checkoutOrder(): Promise<Order> {
    const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
            ...authHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to checkout order");
    return res.json();
}

export async function getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

// ─── Favorites API ──────────────────────────────────────────────────────────────

export type FavoriteItem = {
    favoriteId: number;
    productAsin: string;
    title: string;
    priceValue: string;
    imageUrl: string;
};

export async function getFavorites(): Promise<FavoriteItem[]> {
    const res = await fetch(`${BASE_URL}/api/favorites`, {
        cache: "no-store",
        headers: {
            ...authHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch favorites");
    return res.json();
}

export async function toggleFavorite(asin: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/favorites/toggle/${encodeURIComponent(asin)}`, {
        method: "POST",
        headers: {
            ...authHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to toggle favorite");
    return res.text();
}
