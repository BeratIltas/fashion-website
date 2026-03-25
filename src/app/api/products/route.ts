export async function GET() {
  return Response.json(
    {
      message: "Use the external products API configured in src/lib/api.ts.",
    },
    { status: 501 }
  );
}
