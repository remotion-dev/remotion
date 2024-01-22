import { renderMedia } from "@remotion/renderer";
import { expect, test } from "bun:test";

test("Fatal error on frame 10 should yield correct error", async () => {
  await expect(() => {
    return renderMedia({
      codec: "h264",
      serveUrl:
        "https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/",
      composition: {
        durationInFrames: 1000000,
        fps: 30,
        height: 720,
        id: "error-on-frame-10",
        width: 1280,
        defaultProps: {},
        props: {},
        defaultCodec: null,
      },
      outputLocation: "out/render.mp4",
    });
  }).toThrow(/Invalid array length/);
});
