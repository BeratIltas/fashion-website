import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = await request.json();
  const res = await fetch(`${BASE_URL}/api/seller/products/${asin}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ message: text || "Failed to update product" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  const { asin } = await params;
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/seller/products/${asin}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to delete product" }, { status: res.status });
  }
  return NextResponse.json({ success: true });
}
