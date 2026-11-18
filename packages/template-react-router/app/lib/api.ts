import { z } from "zod";
import {
  CompositionProps,
  ProgressRequest,
  ProgressResponse,
  RenderRequest,
  RenderStreamEvent,
} from "~/remotion/schemata";

export const renderVideo = async ({
  inputProps,
  onEvent,
}: {
  inputProps: z.infer<typeof CompositionProps>;
  onEvent: (event: RenderStreamEvent) => void;
}) => {
  const body: z.infer<typeof RenderRequest> = {
    inputProps,
  };
  const response = await fetch("/api/lambda/render", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const error = (await response.json()) as { message: string };
    throw new Error(error.message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("The render response has no body.");
  }

  let render: { renderId: string; bucketName: string } | null = null;
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch {
        break;
      }
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        const event = JSON.parse(line) as RenderStreamEvent;
        if (event.type === "started") {
          render = { renderId: event.renderId, bucketName: event.bucketName };
        }
        onEvent(event);
        if (event.type === "done" || event.type === "error") {
          return;
        }
        newline = buffer.indexOf("\n");
      }
      if (chunk.done) {
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }

  if (!render) {
    throw new Error(
      "The connection ended before a render ID was received. The render may still be running.",
    );
  }

  while (true) {
    const event = await getProgress({
      id: render.renderId,
      bucketName: render.bucketName,
    });
    onEvent(event);
    if (event.type === "done" || event.type === "error") {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const getProgress = async (
  body: z.infer<typeof ProgressRequest>,
): Promise<ProgressResponse> => {
  const response = await fetch("/api/lambda/progress", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const json = (await response.json()) as
    | { type: "error"; message: string }
    | { type: "success"; data: ProgressResponse };
  if (json.type === "error") {
    throw new Error(json.message);
  }
  return json.data;
};
