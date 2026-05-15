const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("auth_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

function adminHeaders(withContentType = false): HeadersInit {
  const token = getAdminToken();
  const base: Record<string, string> = {};
  if (withContentType) base["Content-Type"] = "application/json";
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

async function handleResponse<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    let msg = fallback;
    try {
      const data = await res.json();
      if (data?.message) msg = String(data.message);
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type MonthlyRevenue = { month: string; amount: number };
export type TopCategory = { category: string; count: number };
export type RecentOrder = { orderId: number; customerName: string; amount: number; status: string; date: string };
export type LowStockProduct = { asin: string; title: string; stock: number };

export type DashboardStats = {
  totalSales: number;
  orderCount: number;
  productCount: number;
  customerCount: number;
  monthlyRevenue: number;
  last6MonthsRevenue: MonthlyRevenue[];
  topCategories: TopCategory[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
};

export type AdminOrderUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  authProvider: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  photoURL?: string;
};

export type AdminOrderItem = {
  id: number;
  product: {
    asin: string;
    title: string;
    priceValue: string;
    brandName?: string;
    category?: string;
    ratingStars?: string;
    sellerName?: string;
    availability?: string;
    allImages?: string;
    images?: { id: number; imageUrl: string }[];
  };
  quantity: number;
  priceAtPurchase: number;
};

export type AdminOrder = {
  id: number;
  user: AdminOrderUser;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: AdminOrderItem[];
};

export type AdminProduct = {
  asin: string;
  title: string;
  brandName: string;
  priceValue: string;
  category: string;
  ratingStars: string;
  ratingCount: string;
  allImages: string[];
  ownerId: number;
  ownerEmail: string;
  ownerFullName: string;
};

export type Announcement = {
  id: number;
  message: string;
  createdAt: string;
  active: boolean;
};

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  authProvider: string;
  photoURL?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export type ContactMessage = {
  id: number;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<DashboardStats>(res, "Failed to fetch dashboard stats");
}

export async function getAdminOrders(sellerName?: string): Promise<AdminOrder[]> {
  const params = new URLSearchParams();
  if (sellerName) params.set("sellerName", sellerName);
  const res = await fetch(`${BASE_URL}/api/admin/orders${params.size ? `?${params}` : ""}`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<AdminOrder[]>(res, "Failed to fetch orders");
}

export async function getAdminProducts(opts?: {
  sellerId?: number;
  sellerName?: string;
  page?: number;
  size?: number;
}): Promise<AdminProduct[]> {
  const params = new URLSearchParams();
  if (opts?.sellerId != null) params.set("sellerId", String(opts.sellerId));
  if (opts?.sellerName) params.set("sellerName", opts.sellerName);
  params.set("page", String(opts?.page ?? 0));
  params.set("size", String(opts?.size ?? 50));
  const res = await fetch(`${BASE_URL}/api/admin/products?${params}`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<AdminProduct[]>(res, "Failed to fetch products");
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${BASE_URL}/api/admin/announcements`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<Announcement[]>(res, "Failed to fetch announcements");
}

export async function createAnnouncement(message: string, active: boolean): Promise<Announcement> {
  const res = await fetch(`${BASE_URL}/api/admin/announcements`, {
    method: "POST",
    headers: adminHeaders(true),
    body: JSON.stringify({ message, active }),
  });
  return handleResponse<Announcement>(res, "Failed to create announcement");
}

export async function toggleAnnouncement(id: number): Promise<Announcement> {
  const token = getAdminToken();
  const headers: HeadersInit = {};
  if (token) headers["x-auth-token"] = token;

  const res = await fetch(`/api/admin/announcements/${id}?action=toggle`, {
    method: "PATCH",
    headers,
  });
  return handleResponse<Announcement>(res, "Failed to toggle announcement");
}

export async function getAdminUsers(role?: string): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  const res = await fetch(`${BASE_URL}/api/admin/users${params.size ? `?${params}` : ""}`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<AdminUser[]>(res, "Failed to fetch users");
}

export async function getContactMessages(unreadOnly = false): Promise<ContactMessage[]> {
  const res = await fetch(`${BASE_URL}/api/admin/contact?unreadOnly=${unreadOnly}`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<ContactMessage[]>(res, "Failed to fetch contact messages");
}

export async function markContactRead(id: number): Promise<ContactMessage> {
  const token = getAdminToken();
  const headers: HeadersInit = {};
  if (token) headers["x-auth-token"] = token;

  const res = await fetch(`/api/admin/contact/${id}`, {
    method: "PATCH",
    headers,
  });
  return handleResponse<ContactMessage>(res, "Failed to mark as read");
}

// ─── Product Detail ───────────────────────────────────────────────────────────

export type ReviewDto = {
  id: number;
  reviewTitle: string;
  reviewText: string;
  rating: string;
  verifiedPurchase: string;
  reviewMetadata: string;
  userName: string;
  createdByCurrentUser: boolean;
};

export type ProductDetailDto = {
  asin: string;
  title: string;
  priceValue: string;
  brandName: string;
  ratingStars: string;
  ratingCount: string;
  allImages: string[];
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
  favorite: boolean;
};

export async function getProductDetail(asin: string): Promise<ProductDetailDto> {
  const res = await fetch(`${BASE_URL}/api/products/${asin}`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<ProductDetailDto>(res, "Failed to fetch product detail");
}

export async function getProductReviews(asin: string): Promise<ReviewDto[]> {
  const res = await fetch(`${BASE_URL}/api/products/${asin}/reviews`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<ReviewDto[]>(res, "Failed to fetch reviews");
}

// ─── Seller Product Management ───────────────────────────────────────────────

export async function getSellerProducts(): Promise<AdminProduct[]> {
  const PAGE_SIZE = 100;
  const all: AdminProduct[] = [];
  let page = 0;
  while (true) {
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    const res = await fetch(`${BASE_URL}/api/seller/products?${params}`, {
      cache: "no-store",
      headers: adminHeaders(),
    });
    const data = await handleResponse<AdminProduct[]>(res, "Failed to load products");
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  return all;
}

export type ProductUpdateDto = {
  title?: string;
  aboutItem?: string;
  priceValue?: string;
  availability?: string;
  stock?: number;
  category?: string;
  brandName?: string;
  imageUrls?: string[];
};

export async function updateProduct(asin: string, data: ProductUpdateDto): Promise<void> {
  const token = getAdminToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/seller/products/${asin}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = "Failed to update product";
    try { const d = await res.json() as { message?: string }; if (d.message) msg = d.message; } catch { /* */ }
    throw new Error(msg);
  }
}

export type ProductCreateDto = {
  title: string;
  brandName?: string;
  priceValue: string;
  aboutItem?: string;
  category?: string;
  availability?: string;
  stock?: number;
  deliveryDate?: string;
  fastestDeliveryDate?: string;
  imageUrls?: string[];
};

export async function createProduct(data: ProductCreateDto): Promise<AdminProduct> {
  const token = getAdminToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/seller/products`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse<AdminProduct>(res, "Failed to create product");
}

export async function deleteProduct(asin: string): Promise<void> {
  const token = getAdminToken();
  const headers: HeadersInit = {};
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/seller/products/${asin}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

// ─── Seller Dashboard ────────────────────────────────────────────────────────

export type SellerDashboardMetrics = {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  averageRating: number;
  salesChangePercent: number;
  ordersChangePercent: number;
};

export type SellerSalesChart = {
  labels: string[];           // e.g. ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
  currentPeriod: number[];    // sales amount per label, same length as labels
  previousPeriod: number[];   // previous period comparison, same length as labels
};

export type SellerBestSeller = {
  asin: string;
  title: string;
  subtitle: string;     // e.g. variant name, edition
  price: number;
  unitsSold: number;
  imageUrl: string;
};

export type SellerRecentOrder = {
  orderId: number;
  customerName: string;
  orderDate: string;     // ISO date string e.g. "2024-10-24"
  status: "SHIPPED" | "PENDING" | "PROCESSING" | "CANCELED" | "DELIVERED";
  totalAmount: number;
};

export type SellerDashboard = {
  metrics: SellerDashboardMetrics;
  salesChart: SellerSalesChart;
  bestSellers: SellerBestSeller[];
  recentOrders: SellerRecentOrder[];
};

export async function getSellerDashboard(): Promise<SellerDashboard> {
  const res = await fetch(`${BASE_URL}/api/seller/dashboard`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<SellerDashboard>(res, "Failed to fetch seller dashboard");
}

// ─── Seller Statistics & Orders ──────────────────────────────────────────────

export type SellerStatistics = {
  totalSalesCount: number;
  totalRevenue: number;
  pendingOrderCount: number;
  shippedOrderCount: number;
  deliveredOrderCount: number;
  cancelledOrderCount: number;
  activeProductsCount: number;
  dailyRevenue?: { date: string; revenue: number }[];
  categoryDistribution?: { category: string; count: number }[];
};

export type SellerOrder = {
  id: number;
  user: AdminOrderUser;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: AdminOrderItem[];
};

export async function getSellerStatistics(): Promise<SellerStatistics> {
  const res = await fetch(`${BASE_URL}/api/seller/statistics`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<SellerStatistics>(res, "Failed to fetch seller statistics");
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  const res = await fetch(`${BASE_URL}/api/seller/orders`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<SellerOrder[]>(res, "Failed to fetch seller orders");
}

export async function updateSellerOrderStatus(orderId: number, status: string): Promise<SellerOrder> {
  const token = getAdminToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/seller/orders/${orderId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status }),
  });
  return handleResponse<SellerOrder>(res, "Failed to update order status");
}

// ─── Seller Returns ──────────────────────────────────────────────────────────

export type SellerReturn = {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: string;
  requestDate: string;
  resolvedDate: string | null;
  sellerNote: string | null;
};

export async function getSellerReturns(): Promise<SellerReturn[]> {
  const res = await fetch(`${BASE_URL}/api/seller/returns`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  return handleResponse<SellerReturn[]>(res, "Failed to fetch seller returns");
}

export async function resolveSellerReturn(id: number, status: string, sellerNote: string): Promise<SellerReturn> {
  const token = getAdminToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/seller/returns/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status, sellerNote }),
  });
  return handleResponse<SellerReturn>(res, "Failed to resolve return");
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export async function generateCoupon(): Promise<string> {
  const token = getAdminToken();
  const headers: HeadersInit = {};
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/admin/discounts/generate`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to generate coupon");
  const data = await res.json() as { code: string };
  return data.code;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (token) headers["x-auth-token"] = token;
  const res = await fetch(`/api/seller/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  const data = await res.json() as { url?: string };
  const url = data.url ?? "";
  if (!url) throw new Error("No image URL in response");
  return url;
}

export async function verifyCoupon(code: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/discounts/apply?code=${encodeURIComponent(code)}`, {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Invalid or expired coupon");
  return res.json() as Promise<number>;
}
