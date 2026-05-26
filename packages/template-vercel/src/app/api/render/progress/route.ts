import { getRenderProgress } from "@remotion/vercel";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sandboxId = url.searchParams.get("sandboxId");
  const cmdId = url.searchParams.get("cmdId");

  if (!sandboxId || !cmdId) {
    return Response.json(
      { error: "Missing sandboxId or cmdId." },
      { status: 400 },
    );
  }

  // Production apps should also verify the current user owns this render handle.
  const progress = await getRenderProgress({ sandboxId, cmdId });
  return Response.json(progress);
}
