import { renderMedia, selectComposition } from "@remotion/renderer";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { makeCancelSignal } from "@remotion/renderer";
import path from "node:path";

export type RenderJob = {
  id: string;
  progress: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
};

export const rendersDir = path.resolve("renders");

export const renderJobs = new Map<string, RenderJob>();

const compositionId = "HelloWorld";

const renderEvents = new EventEmitter();

renderEvents.on("start-render", async ({ jobId, remotionBundleUrl }) => {
  renderJobs.set(jobId, {
    id: jobId,
    progress: 0,
    status: "pending",
  });

  const composition = await selectComposition({
    serveUrl: remotionBundleUrl,
    id: compositionId,
  });

  const { cancel, cancelSignal } = makeCancelSignal();

  const cancelHandler = (jobIdToCancel: string) => {
    if (jobId !== jobIdToCancel) return;

    console.info(`Cancelling ${jobId} render...`);

    cancel();
  };

  try {
    const renderPromise = renderMedia({
      cancelSignal,
      serveUrl: remotionBundleUrl,
      composition,
      codec: "h264",
      onProgress: (progress) => {
        console.info(`${jobId} render progress:`, progress.progress);
        renderJobs.set(jobId, {
          id: jobId,
          progress: progress.progress,
          status: "processing",
        });
      },
      outputLocation: path.join(rendersDir, `${jobId}.mp4`),
    });

    // setup cancel handler
    renderEvents.on("cancel-render", cancelHandler);

    await renderPromise;
    renderJobs.set(jobId, {
      id: jobId,
      progress: 100,
      status: "completed",
    });
  } catch (error) {
    console.error(error);
    renderJobs.set(jobId, {
      id: jobId,
      progress: 100,
      status: "failed",
    });
  } finally {
    renderEvents.off("cancel-render", cancelHandler);
  }
});

export function createRenderJob(remotionBundleUrl: string) {
  const jobId = randomUUID();

  renderEvents.emit("start-render", { jobId, remotionBundleUrl });

  return jobId;
}

export function cancelRenderJob(jobId: string) {
  renderEvents.emit("cancel-render", jobId);
}
