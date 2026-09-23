import {fade} from "@remotion/transitions/fade";
import {bookFlip} from "@remotion/transitions/book-flip";
import {crosswarp} from "@remotion/transitions/crosswarp";
import {dissolve} from "@remotion/transitions/dissolve";
import {ripple} from "@remotion/transitions/ripple";
import {swap} from "@remotion/transitions/swap";
import {zoomBlur} from "@remotion/transitions/zoom-blur";
import {zoomInOut} from "@remotion/transitions/zoom-in-out";
import {blurSlide, crossZoom, dreamyZoom, filmBurn, linearBlur} from "@remotion/transitions";
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
// It's a canvas-drawn circular reveal -- the same look as the built-in,
// CSS-based iris() from @remotion/transitions/iris, which FullReel uses and
// which needs no HtmlInCanvas support. This one exists to show how a custom
// presentation is authored.
const circleRevealShader: HtmlInCanvasShader<Record<string, never>> = (canvas) => {
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

const circleReveal = makeHtmlInCanvasPresentation(circleRevealShader);

// @remotion/transitions ships a whole family of *other* built-in
// presentations beyond fade()/slide()/wipe(): bookFlip, crossZoom,
// crosswarp, dissolve, dreamyZoom, filmBurn, linearBlur, ripple, swap,
// zoomBlur, zoomInOut and blurSlide. Every one of them is ALSO built with
// makeHtmlInCanvasPresentation() internally (see each's source under
// packages/transitions/src/presentations/), so they all need the exact
// same Chrome 149+ HTML-in-canvas support as the custom circle reveal above --
// this one shared helper wraps any such presentation factory with the same
// isSupported()-gated fallback to fade(), rather than repeating the same
// three-line check twelve times.
const orFallback = <TPassedProps extends Record<string, unknown>>(
  presentation: (props: TPassedProps) => TransitionPresentation<TPassedProps>,
  props: TPassedProps,
) => (): TransitionPresentation<Record<string, unknown>> =>
  (HtmlInCanvas.isSupported() ? presentation(props) : fade()) as TransitionPresentation<Record<string, unknown>>;

export const canvasCircleRevealOrFallback = orFallback(circleReveal, {});
export const bookFlipOrFallback = orFallback(bookFlip, {});
export const crossZoomOrFallback = orFallback(crossZoom, {});
export const crosswarpOrFallback = orFallback(crosswarp, {});
export const dissolveOrFallback = orFallback(dissolve, {});
export const dreamyZoomOrFallback = orFallback(dreamyZoom, {});
export const filmBurnOrFallback = orFallback(filmBurn, {});
export const linearBlurOrFallback = orFallback(linearBlur, {});
export const rippleOrFallback = orFallback(ripple, {});
export const swapOrFallback = orFallback(swap, {});
export const zoomBlurOrFallback = orFallback(zoomBlur, {});
export const zoomInOutOrFallback = orFallback(zoomInOut, {});
export const blurSlideOrFallback = orFallback(blurSlide, {});
