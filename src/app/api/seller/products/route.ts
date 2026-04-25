import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = await request.json();
  const res = await fetch(`${BASE_URL}/api/seller/products`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ message: text || "Failed to create product" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
