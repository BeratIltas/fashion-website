import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const formData = await request.formData();
  const res = await fetch(`${BASE_URL}/api/users/profile-image`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to upload image" }, { status: res.status });
  }
  const url = await res.text();
  return NextResponse.json({ url: url.trim().replace(/^"|"$/g, "") });
}
