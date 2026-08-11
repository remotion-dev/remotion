import {
  addBundleToSandbox,
  createSandbox,
  renderMediaOnVercel,
  uploadToVercelBlob,
} from "@remotion/vercel";
import { waitUntil } from "@vercel/functions";
import { COMP_NAME } from "../../../../types/constants";
import { RenderRequest } from "../../../../types/schema";
import {
  bundleRemotionProject,
  formatSSE,
  type RenderProgress,
} from "./helpers";
import { restoreSnapshot } from "./restore-snapshot";

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. To fix this, go to vercel.com, log in, select Storage, click "Create Database", select "Blob", link it to your project, then add BLOB_READ_WRITE_TOKEN to your .env file.',
    );
  }

  const payload = await req.json();
  const body = RenderRequest.parse(payload);

  const send = async (message: RenderProgress) => {
    await writer.write(encoder.encode(formatSSE(message)));
  };

  const runRender = async () => {
    await send({ type: "phase", phase: "Creating sandbox...", progress: 0 });
    const sandbox = process.env.VERCEL
      ? await restoreSnapshot()
      : await createSandbox({
          onProgress: async ({ progress, message }) => {
            await send({
              type: "phase",
              phase: message,
              progress,
              subtitle: "This is only needed during development.",
            });
          },
        });

    try {
      if (!process.env.VERCEL) {
        bundleRemotionProject(".remotion");
        await addBundleToSandbox({ sandbox, bundleDir: ".remotion" });
      }

      const { sandboxFilePath, contentType } = await renderMediaOnVercel({
        sandbox,
        compositionId: COMP_NAME,
        inputProps: body.inputProps,
        onProgress: async (update) => {
          switch (update.stage) {
            case "opening-browser":
              await send({
                type: "phase",
                phase: "Opening browser...",
                progress: update.overallProgress,
              });
              break;
            case "selecting-composition":
              await send({
                type: "phase",
                phase: "Selecting composition...",
                progress: update.overallProgress,
              });
              break;
            case "render-progress":
              await send({
                type: "phase",
                phase: "Rendering video...",
                progress: update.overallProgress,
              });
              break;
            default:
              break;
          }
        },
      });

      await send({
        type: "phase",
        phase: "Uploading video...",
        progress: 1,
      });

      const { url, size } = await uploadToVercelBlob({
        sandbox,
        sandboxFilePath,
        contentType,
        blobToken,
        access: "public",
      });

      await send({ type: "done", url, size });
    } catch (err) {
      console.log(err);
      await send({ type: "error", message: (err as Error).message });
    } finally {
      await sandbox?.stop().catch(() => {});
      await writer.close();
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
