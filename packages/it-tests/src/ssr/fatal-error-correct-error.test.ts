import { renderMedia } from "@remotion/renderer";
import { expect, test } from "vitest";

test("Fatal error on frame 10 should yield correct error", async () => {
  await expect(() => {
    return renderMedia({
      codec: "h264",
      serveUrl:
        "https://64804302bfd41946b23d7b35--lovely-dieffenbachia-90a6f1.netlify.app/",
      composition: {
        durationInFrames: 1000000,
        fps: 30,
        height: 720,
        id: "error-on-frame-10",
        width: 1280,
      },
      outputLocation: "out/render.mp4",
    });
  }).rejects.toThrow(/Invalid array length/);
});
