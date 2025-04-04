import express from "express";
import { cancelRenderJob, createRenderJob, renderJobs } from "./render-worker";
import { bundle } from "@remotion/bundler";
import path from "node:path";

function setupApp({ remotionBundleUrl }: { remotionBundleUrl: string }) {
  const app = express();

  app.post("/renders", async (req, res) => {
    const jobId = createRenderJob(remotionBundleUrl);

    res.json({ jobId });
  });

  // get a job status
  app.get("/renders/:jobId", (req, res) => {
    const jobId = req.params.jobId;
    const job = renderJobs.get(jobId);

    res.json(job);
  });

  // cancel a job
  app.delete("/renders/:jobId", (req, res) => {
    const jobId = req.params.jobId;

    const job = renderJobs.get(jobId);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    if (job.status !== "pending" && job.status !== "processing") {
      res.status(400).json({ message: "Job is not cancellable" });
      return;
    }

    cancelRenderJob(jobId);

    res.json({ message: "Job cancelled" });
  });

  return app;
}

async function main() {
  // TODO: ability to provide serveUrl via env variable
  const remotionBundleUrl = await bundle({
    entryPoint: path.resolve("remotion/index.ts"),
    onProgress(progress) {
      console.info(`Bundling remotion composition: ${progress}%`);
    },
  });

  const app = setupApp({ remotionBundleUrl });

  app.listen(3000, () => {
    console.info("Server is running on port 3000");
  });
}

main();
