import { makeCancelSignal, renderStill } from "@remotion/renderer";
import { expect, test } from "vitest";

test("Should be able to cancel render", async () => {
  try {
    const { cancel, cancelSignal } = makeCancelSignal();
    const val = renderStill({
      serveUrl:
        "https://649c2591dc13fa0aa817f746--helpful-frangollo-8c4f55.netlify.app/",
      composition: {
        durationInFrames: 1000000,
        fps: 30,
        height: 720,
        id: "react-svg",
        width: 1280,
        defaultProps: {},
        props: {},
      },
      cancelSignal,
      output: "out/hithere.png",
    });

    setTimeout(() => {
      cancel();
    }, 100);
    await val;

    throw new Error("Render should not succeed");
  } catch (err) {
    expect((err as Error).message).toContain("renderStill() got cancelled");
  }
});
