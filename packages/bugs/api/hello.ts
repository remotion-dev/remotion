import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!request.url) return response.status(400);

  const url = new URL(request.url, `http://${request.headers.host}`);
  const { searchParams } = url;
  const hasTitle = searchParams.has("title");
  const title = hasTitle
    ? searchParams.get("title")?.slice(0, 100)
    : "My default title";

  return response.status(200).json({ title });
}
