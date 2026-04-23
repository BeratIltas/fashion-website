import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get("x-auth-token");
  const action = new URL(request.url).searchParams.get("action");

  const backendUrl = action === "toggle"
    ? `${BASE_URL}/api/admin/announcements/${id}/toggle`
    : `${BASE_URL}/api/admin/announcements/${id}`;

  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(backendUrl, {
    method: "PATCH",
    headers,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
