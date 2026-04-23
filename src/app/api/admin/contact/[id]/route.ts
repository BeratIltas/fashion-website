import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ecommerce-backend-production-628e.up.railway.app";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("x-auth-token");
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/admin/contact/${id}/read`, {
    method: "PATCH",
    headers,
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to mark as read" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
