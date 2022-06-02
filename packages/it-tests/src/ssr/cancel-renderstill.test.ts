import { getCancelSignal, renderStill } from "@remotion/renderer";

test("Should be able to cancel render", async () => {
  try {
    const { cancel, cancelSignal } = getCancelSignal();
    const val = renderStill({
      serveUrl: "https://silly-crostata-c4c336.netlify.app/",
      composition: {
        durationInFrames: 1000000,
        fps: 30,
        height: 720,
        id: "react-svg",
        width: 1280,
      },
      signal: cancelSignal,
      output: "out/hithere.png",
    });

    setTimeout(() => {
      cancel();
    }, 1000);
    await val;

    throw new Error("Render should not succeed");
  } catch (err) {
    expect((err as Error).message).toContain("renderStill() got cancelled");
  }
});
