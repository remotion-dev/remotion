import { makeCancelSignal, renderFrames } from "@remotion/renderer";
import { expect, test } from "vitest";

test("Should be able to cancel render", async () => {
  try {
    const { cancel, cancelSignal } = makeCancelSignal();
    const val = renderFrames({
      serveUrl: "https://silly-crostata-c4c336.netlify.app/",
      composition: {
        durationInFrames: 1000000,
        fps: 30,
        height: 720,
        id: "react-svg",
        width: 1280,
      },
      cancelSignal,
      imageFormat: "jpeg",
      inputProps: {},
      onFrameUpdate: () => undefined,
      onStart: () => undefined,
      outputDir: null,
    });

    setTimeout(() => {
      cancel();
    }, 1000);
    await val;

    throw new Error("Render should not succeed");
  } catch (err) {
    expect((err as Error).message).toContain("renderFrames() got cancelled");
  }
});
