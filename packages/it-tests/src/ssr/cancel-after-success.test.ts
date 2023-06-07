import { renderMedia, makeCancelSignal } from "@remotion/renderer";
import fs from "fs";
import path from "path";
import { test } from "vitest";

test("Cancelling after success should not throw error", async () => {
  const { cancel, cancelSignal } = makeCancelSignal();
  const outputLocation = "out/render.mp4";
  await renderMedia({
    codec: "h264",
    serveUrl:
      "https://64804302bfd41946b23d7b35--lovely-dieffenbachia-90a6f1.netlify.app/",
    composition: {
      durationInFrames: 4,
      fps: 30,
      height: 720,
      id: "react-svg",
      width: 1280,
    },
    concurrency: 1,
    outputLocation,
    cancelSignal,
  });

  cancel();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await fs.promises.rm(path.join(process.cwd(), outputLocation));
});
