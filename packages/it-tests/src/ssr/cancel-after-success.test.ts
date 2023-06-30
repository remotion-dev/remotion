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
      "https://649ea0770f2b6b55f2a5425c--effulgent-pixie-5f5cfb.netlify.app/",
    composition: {
      durationInFrames: 4,
      fps: 30,
      height: 720,
      id: "react-svg",
      width: 1280,
      defaultProps: {},
      props: {},
    },
    concurrency: 1,
    outputLocation,
    cancelSignal,
  });

  cancel();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await fs.promises.rm(path.join(process.cwd(), outputLocation));
});
