import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/discounts/generate`, {
    method: "POST",
    headers,
  });

  const text = await res.text();
  return NextResponse.json({ code: text }, { status: res.status });
}
