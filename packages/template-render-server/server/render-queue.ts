import {
  makeCancelSignal,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { randomUUID } from "node:crypto";
import path from "node:path";

type JobState =
  | {
      status: "queued";
      cancel: () => void;
    }
  | {
      status: "in-progress";
      progress: number;
      cancel: () => void;
    }
  | {
      status: "completed";
      videoUrl: string;
    }
  | {
      status: "failed";
      error: Error;
    }
  | {
      status: "cancelled";
    };

const compositionId = "HelloWorld";

export const makeRenderQueue = ({
  port,
  serveUrl,
  rendersDir,
}: {
  port: number;
  serveUrl: string;
  rendersDir: string;
}) => {
  const jobs = new Map<string, JobState>();
  let queue: Promise<unknown> = Promise.resolve();

  const processRender = async (jobId: string) => {
    const job = jobs.get(jobId);
    if (!job) {
      throw new Error(`Render job ${jobId} not found`);
    }

    const { cancel, cancelSignal } = makeCancelSignal();

    jobs.set(jobId, {
      progress: 0,
      status: "in-progress",
      cancel: cancel,
    });

    try {
      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
      });

      await renderMedia({
        cancelSignal,
        serveUrl,
        composition,
        codec: "h264",
        onProgress: (progress) => {
          console.info(`${jobId} render progress:`, progress.progress);
          jobs.set(jobId, {
            progress: progress.progress,
            status: "in-progress",
            cancel: cancel,
          });
        },
        outputLocation: path.join(rendersDir, `${jobId}.mp4`),
      });

      jobs.set(jobId, {
        status: "completed",
        videoUrl: `http://localhost:${port}/renders/${jobId}.mp4`,
      });
    } catch (error) {
      console.error(error);
      jobs.set(jobId, {
        status: "failed",
        error: error as Error,
      });
    }
  };

  const queueRender = async ({ jobId }: { jobId: string }) => {
    jobs.set(jobId, {
      status: "queued",
      cancel: () => {
        jobs.delete(jobId);
      },
    });

    queue = queue.then(() => {
      processRender(jobId);
    });
  };

  function createJob() {
    const jobId = randomUUID();

    queueRender({ jobId });

    return jobId;
  }

  return {
    createJob,
    jobs,
  };
};
