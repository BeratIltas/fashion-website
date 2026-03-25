export async function POST() {
  return Response.json(
    {
      message: "Use the external orders API configured in src/lib/api.ts.",
    },
    { status: 501 }
  );
}
