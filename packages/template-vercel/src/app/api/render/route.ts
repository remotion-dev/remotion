import { waitUntil } from "@vercel/functions";
import { RenderRequest } from "../../../../types/schema";
import {
  createDisposableWriter,
  formatSSE,
  type RenderProgress,
} from "./helpers";
import { renderInSandbox } from "./render";
import { reuseOrCreateSandbox } from "./sandbox/reuse-or-create-sandbox";

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

      await send({ type: "phase", phase: "Creating sandbox...", progress: 0 });
      await using sandbox = await reuseOrCreateSandbox(send);
      await renderInSandbox({
        sandbox,
        inputProps: body.inputProps,
        onProgress: async (update) => {
          switch (update.type) {
            case "opening-browser":
              await send({
                type: "phase",
                phase: "Opening browser...",
                progress: 0,
              });
              break;
            case "selecting-composition":
              await send({
                type: "phase",
                phase: "Selecting composition...",
                progress: 0,
              });
              break;
            case "render-progress":
              await send({
                type: "phase",
                phase: "Rendering video...",
                progress: update.progress,
              });
              break;
            case "uploading":
              await send({
                type: "phase",
                phase: "Uploading video...",
                progress: 1,
              });
              break;
            case "done":
              await send({ type: "done", url: update.url, size: update.size });
              break;
            default:
              update satisfies never;
              break;
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
