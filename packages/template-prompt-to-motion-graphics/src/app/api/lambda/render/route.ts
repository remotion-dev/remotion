import {
  AwsRegion,
  renderMediaOnLambdaAndStream,
  speculateFunctionName,
} from "@remotion/lambda/client";
import {
  DISK,
  RAM,
  REGION,
  SITE_NAME,
  TIMEOUT,
} from "../../../../../config.mjs";
import { COMP_NAME } from "../../../../../types/constants";
import { RenderRequest, RenderStreamEvent } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";

export const POST = executeApi<Response, typeof RenderRequest>(
  RenderRequest,
  async (req, body) => {
    if (
      !process.env.AWS_ACCESS_KEY_ID &&
      !process.env.REMOTION_AWS_ACCESS_KEY_ID
    ) {
      throw new TypeError(
        "Set up Remotion Lambda to render videos. See the README.md for how to do so.",
      );
    }
    if (
      !process.env.AWS_SECRET_ACCESS_KEY &&
      !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
    ) {
      throw new TypeError(
        "The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.",
      );
    }

    let closed = false;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: RenderStreamEvent) => {
          if (closed) {
            throw new Error("The render response was closed.");
          }
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        };

        try {
          const result = await renderMediaOnLambdaAndStream({
            codec: "h264",
            functionName: speculateFunctionName({
              diskSizeInMb: DISK,
              memorySizeInMb: RAM,
              timeoutInSeconds: TIMEOUT,
            }),
            region: REGION as AwsRegion,
            serveUrl: SITE_NAME,
            composition: COMP_NAME,
            inputProps: body.inputProps,
            framesPerLambda: 60,
            downloadBehavior: {
              type: "download",
              fileName: "video.mp4",
            },
            onInit: ({ renderId, bucketName }) => {
              send({ type: "started", renderId, bucketName });
            },
            onProgress: ({ overallProgress }) => {
              send({
                type: "progress",
                progress: Math.max(0.03, overallProgress),
              });
            },
          });
          if (result.outputSizeInBytes === null) {
            throw new Error("The finished render has no output size.");
          }
          send({
            type: "done",
            url: result.outputFile,
            size: result.outputSizeInBytes,
          });
        } catch (err) {
          if (!closed) {
            send({
              type: "error",
              message: err instanceof Error ? err.message : String(err),
            });
          }
        } finally {
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
      },
      cancel() {
        closed = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  },
);
