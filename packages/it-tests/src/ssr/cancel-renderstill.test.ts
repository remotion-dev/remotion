import { makeCancelSignal, renderStill } from "@remotion/renderer";
import { expect, test } from "vitest";

test("Should be able to cancel render", async () => {
  try {
    const { cancel, cancelSignal } = makeCancelSignal();
    const val = renderStill({
      serveUrl:
        "https://64bea5e14e10611ab1d786f5--vocal-fudge-fd27aa.netlify.app/",
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
