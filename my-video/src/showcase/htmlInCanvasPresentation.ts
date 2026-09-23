import {fade} from "@remotion/transitions/fade";
import type {HtmlInCanvasShader, TransitionPresentation} from "@remotion/transitions";
import {makeHtmlInCanvasPresentation} from "@remotion/transitions";
import {HtmlInCanvas} from "remotion";

// @remotion/transitions' makeHtmlInCanvasPresentation() builds a custom
// <TransitionSeries.Transition> presentation out of a raw canvas shader
// (drawImage() + arbitrary 2D compositing per frame), rather than
// interpolating CSS like fade()/slide()/wipe() do. This needs the same
// browser-level HTML-in-canvas support as the CoreMediaScene/HtmlInCanvas
// capability check (Chrome 149+), so -- exactly like that scene -- it's
// only used when HtmlInCanvas.isSupported() confirms the browser can do it,
// falling back to a plain fade() otherwise rather than throwing mid-render.
const irisWipeShader: HtmlInCanvasShader<Record<string, never>> = (canvas) => {
  const ctx = canvas.getContext("2d")!;
  return {
    clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
    cleanup: () => {},
    draw: ({prevImage, nextImage, width, height, time}) => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      if (prevImage) {
        ctx.drawImage(prevImage, 0, 0, width, height);
      }
      if (nextImage) {
        const maxRadius = Math.hypot(width, height) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, maxRadius * time, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(nextImage, 0, 0, width, height);
        ctx.restore();
      }
    },
  };
};

const irisWipe = makeHtmlInCanvasPresentation(irisWipeShader);

// fade() and irisWipe() carry different (unrelated) presentation-prop
// types, so this factory's return type is widened to a common
// PresentationProps of Record<string, unknown> -- both branches are still
// internally type-correct, only this shared boundary is loosened.
export const irisWipeOrFallback = (): TransitionPresentation<Record<string, unknown>> =>
  (HtmlInCanvas.isSupported() ? irisWipe({}) : fade()) as TransitionPresentation<Record<string, unknown>>;
