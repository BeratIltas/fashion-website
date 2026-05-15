import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = await request.json() as { status: string; sellerNote: string };
  const res = await fetch(`${BASE_URL}/api/seller/returns/${id}/resolve`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to resolve return" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
