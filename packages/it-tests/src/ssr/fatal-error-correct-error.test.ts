import { renderMedia } from "@remotion/renderer";
import { expect, test } from "vitest";

test("Fatal error on frame 10 should yield correct error", async () => {
  await expect(() => {
    return renderMedia({
      codec: "h264",
      serveUrl:
        "https://64bea5e14e10611ab1d786f5--vocal-fudge-fd27aa.netlify.app/",
      composition: {
        durationInFrames: 1000000,
        fps: 30,
        height: 720,
        id: "error-on-frame-10",
        width: 1280,
        defaultProps: {},
        props: {},
      },
      outputLocation: "out/render.mp4",
    });
  }).rejects.toThrow(/Invalid array length/);
});
