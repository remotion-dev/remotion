import { waitUntil } from "@vercel/functions";
import { RenderRequest } from "../../../../types/schema";
import {
  createDisposableWriter,
  formatSSE,
  type RenderProgress,
} from "./helpers";
import { reuseOrCreateSandbox } from "./sandbox/reuse-or-create-sandbox";
import { renderInSandbox } from "./render";

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (message: RenderProgress) => {
    await writer.write(encoder.encode(formatSSE(message)));
  };

  const runRender = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await using _writer = createDisposableWriter(writer);

    try {
      const payload = await req.json();
      const body = RenderRequest.parse(payload);

      await using sandbox = await reuseOrCreateSandbox(send);
      const renderingPhase = "Rendering video...";
      await send({ type: "phase", phase: renderingPhase, progress: 0 });
      await renderInSandbox({
        sandbox,
        inputProps: body.inputProps,
        onProgress: async (update) => {
          if (update.type === "render-progress") {
            await send({
              type: "phase",
              phase: renderingPhase,
              progress: update.progress,
            });
          } else if (update.type === "uploading") {
            await send({
              type: "phase",
              phase: "Uploading video...",
              progress: 1,
            });
          } else if (update.type === "done") {
            await send({ type: "done", url: update.url, size: update.size });
          }
        },
      });
    } catch (err) {
      console.log(err);
      await send({ type: "error", message: (err as Error).message });
    }
  };

  waitUntil(runRender());

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
