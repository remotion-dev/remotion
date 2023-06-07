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
      "https://64804c64f424474c4b192d49--sage-sable-226d60.netlify.app/",
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
