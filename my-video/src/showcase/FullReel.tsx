import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import {clockWipe} from "@remotion/transitions/clock-wipe";
import {flip} from "@remotion/transitions/flip";
import {iris} from "@remotion/transitions/iris";
import {none} from "@remotion/transitions/none";
import {TransitionSeries, linearTiming, pushCut, springTiming} from "@remotion/transitions";
import {zColor, zMatrix, zTextarea} from "@remotion/zod-types";
import type {CalculateMetadataFunction} from "remotion";
import {AbsoluteFill, Easing} from "remotion";
import {z} from "zod";
import {
  blurSlideOrFallback,
  bookFlipOrFallback,
  crossZoomOrFallback,
  crosswarpOrFallback,
  dissolveOrFallback,
  dreamyZoomOrFallback,
  filmBurnOrFallback,
  linearBlurOrFallback,
  rippleOrFallback,
  swapOrFallback,
  zoomBlurOrFallback,
  zoomInOutOrFallback,
} from "./htmlInCanvasPresentation";
import {TitleScene} from "./TitleScene";
import {ShapesScene} from "./ShapesScene";
import {CaptionsScene} from "./CaptionsScene";
import {RouteScene} from "./RouteScene";
import {EffectsScene} from "./EffectsScene";
import {MediaScene} from "./MediaScene";
import {AudioScene} from "./AudioScene";
import {LottieScene} from "./LottieScene";
import {ThreeScene} from "./ThreeScene";
import {ThreeTextScene} from "./ThreeTextScene";
import {GsapScene} from "./GsapScene";
import {FundamentalsScene} from "./FundamentalsScene";
import {InterpolateScene} from "./InterpolateScene";
import {OutroScene} from "./OutroScene";
import {VideoMattingScene} from "./VideoMattingScene";
import {BrowserTranscriptionScene} from "./BrowserTranscriptionScene";
import {AnimatedEmojiScene} from "./AnimatedEmojiScene";
import {SkiaScene} from "./SkiaScene";
import {RiveScene} from "./RiveScene";
import {RoundedTextBoxScene} from "./RoundedTextBoxScene";
import {SfxScene} from "./SfxScene";
import {CoreMediaScene} from "./CoreMediaScene";
import {MediaToolsScene} from "./MediaToolsScene";
import {CoreEnvironmentScene} from "./CoreEnvironmentScene";
import {EFFECTS_CATALOG_DURATION, EffectsCatalogScene} from "./EffectsCatalogScene";
import {CutFlash} from "./CutFlash";
import {palette} from "./palette";

export const fullReelSchema = z.object({
  title: z.string(),
  subtitle: zTextarea(),
  accentColor: zColor(),
  // A flat square array (2x2 here), Studio-editable as a matrix control --
  // applied to the outro wordmark as a real CSS matrix() transform.
  logoMatrix: zMatrix(),
});

export type FullReelProps = z.infer<typeof fullReelSchema>;

const SCENE_DURATION = 75;
const TRANSITION_DURATION = 15;
// Scenes of SCENE_DURATION each; EffectsCatalogScene, the one longer
// sequence, is added separately.
const SCENE_COUNT = 24;
// Separators that are <TransitionSeries.Overlay>s rather than Transitions:
// an overlay sits on the cut without overlapping the scenes, so it doesn't
// shorten the reel.
const OVERLAY_COUNT = 2;

export const fullReelDefaultProps: FullReelProps = {
  title: "Remotion",
  subtitle: "Every capability, one video.",
  accentColor: "#6366f1",
  logoMatrix: [1, 0.05, 0, 1],
};

export const calculateFullReelMetadata: CalculateMetadataFunction<FullReelProps> = () => {
  const sequenceCount = SCENE_COUNT + 1;
  const durationInFrames =
    SCENE_COUNT * SCENE_DURATION + EFFECTS_CATALOG_DURATION - (sequenceCount - 1 - OVERLAY_COUNT) * TRANSITION_DURATION;
  // calculateMetadata() can set more than the duration: these become the
  // CLI's defaults for this composition, and scenes can read them back from
  // useVideoConfig() (CoreEnvironmentScene does).
  return {durationInFrames, defaultCodec: "h264", defaultOutName: "full-reel"};
};

const t = linearTiming({durationInFrames: TRANSITION_DURATION});
// linearTiming() also takes an easing curve for the presentation progress.
const tEased = linearTiming({durationInFrames: TRANSITION_DURATION, easing: Easing.inOut(Easing.cubic)});
// Pinned to TRANSITION_DURATION: left to settle naturally, a damping: 200
// spring takes ~23 frames, which the duration formula above doesn't account
// for — the reel used to end on 8 blank frames because of it.
// reverse runs the spring backwards in time: progress still goes 0 -> 1, but
// starts slow and finishes fast instead of the usual quick start.
const springT = springTiming({config: {damping: 200}, durationInFrames: TRANSITION_DURATION, reverse: true});

// The single, complete demo reel: every scene from ShowcaseReel and
// ExtendedReel combined into one video (one title, one outro — the two
// reels' duplicate bookends are dropped). Its transitions cover all 20
// built-in @remotion/transitions presentations. fade, slide, wipe, flip,
// clockWipe, iris, none() (a no-op meant to pair with
// useTransitionProgress() -- see TitleScene) and pushCut render with CSS,
// several with their tuning options set (fade's shouldFadeOutExitingScene,
// flip's perspective, pushCut's flash and scales). bookFlip, crossZoom, crosswarp,
// dissolve, dreamyZoom, filmBurn, linearBlur, ripple, swap, zoomBlur,
// zoomInOut and blurSlide are built with makeHtmlInCanvasPresentation()
// internally, so each is wrapped in an isSupported()-gated fallback to
// fade() (see htmlInCanvasPresentation.ts) rather than throwing where
// HtmlInCanvas isn't supported. Timings: linearTiming() with and without an
// easing, and springTiming() with reverse on the last one. Two cuts use a
// <TransitionSeries.Overlay> (CutFlash) instead of a transition. ~62s covering: spring
// animation, staggered text, rough-notation highlights, and
// useTransitionProgress() reacting to its own exit transition (TitleScene);
// @remotion/shapes, @remotion/motion-blur, @remotion/noise (ShapesScene);
// @remotion/captions (CaptionsScene); @remotion/paths (RouteScene);
// @remotion/effects chained WebGL2 passes (EffectsScene), then every one of
// its 74 catalog effects on its own (EffectsCatalogScene); @remotion/media +
// @remotion/gif + @remotion/mac-cursors (MediaScene); @remotion/video-matting
// AI background removal (VideoMattingScene); @remotion/media-utils real
// audio waveform (AudioScene); @remotion/whisper-webgpu in-browser
// transcription (BrowserTranscriptionScene); @remotion/lottie (LottieScene);
// @remotion/animated-emoji (AnimatedEmojiScene); @remotion/three, a rotating
// mesh (ThreeScene) then extruded 3D typography via TextGeometry +
// FontLoader (ThreeTextScene, adapted from remotion-dev/3d-text);
// @remotion/skia (SkiaScene); @remotion/rive (RiveScene, API surface only —
// see its own comment for why); @remotion/layout-utils + @remotion/
// rounded-text-box + @remotion/fonts (RoundedTextBoxScene); @remotion/sfx
// (SfxScene); @remotion/gsap (GsapScene); core remotion media/canvas
// components (CoreMediaScene); core remotion environment/introspection APIs
// (CoreEnvironmentScene); core remotion Easing/<Series>/<Loop>/<Freeze>/
// random() (FundamentalsScene); every interpolate() option and its exported
// validators (InterpolateScene); @remotion/animation-utils + rough-notation
// (OutroScene).
export const FullReel: React.FC<FullReelProps> = ({title, subtitle, accentColor, logoMatrix}) => {
  return (
    <AbsoluteFill style={{backgroundColor: "#0b1120"}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <TitleScene title={title} subtitle={subtitle} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade({shouldFadeOutExitingScene: true})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ShapesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={iris({width: 1280, height: 720})} timing={tEased} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CaptionsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({direction: "from-left", perspective: 500})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RouteScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={clockWipe({width: 1280, height: 720})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <EffectsScene accentColor={accentColor} />
        </TransitionSeries.Sequence>
        {/* An overlay, not a transition: a transition mounts both scenes at
            once, and EffectsScene's 4 WebGL2 contexts plus the catalog's 12
            would sit exactly at Chrome's limit of 16, with no headroom (see
            EffectsCatalogScene). */}
        <TransitionSeries.Overlay durationInFrames={20}>
          <CutFlash />
        </TransitionSeries.Overlay>

        <TransitionSeries.Sequence durationInFrames={EFFECTS_CATALOG_DURATION}>
          <EffectsCatalogScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-bottom"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <MediaScene />
        </TransitionSeries.Sequence>
        {/* none() has no visual effect of its own -- it's meant to be paired
            with useTransitionProgress() (see TitleScene) for a fully custom
            transition. Used here as a plain hard cut, which is the expected
            look without that hook. */}
        <TransitionSeries.Transition presentation={none()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <VideoMattingScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushCut({
            flashColor: palette.accent2,
            flashOpacity: 0.6,
            flashFrames: 4,
            // Cut a little earlier than the default (5/11), and push further
            // into the outgoing scene than the default 1.04.
            cutProgress: 0.4,
            outgoingScale: 1.15,
            incomingStartScale: 1.1,
            // TransitionSeries keeps the entering scene inside the
            // presentation, at progress 1, for the rest of its sequence. So
            // the default, 1.07, would leave AudioScene zoomed in and cropped
            // until it ends, not just during the cut.
            incomingEndScale: 1,
          })}
          timing={t}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <AudioScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={crossZoomOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <BrowserTranscriptionScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={dreamyZoomOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <LottieScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <AnimatedEmojiScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={filmBurnOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ThreeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-left"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ThreeTextScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={bookFlipOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <SkiaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlurOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RiveScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={crosswarpOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RoundedTextBoxScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={dissolveOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <SfxScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={linearBlurOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <GsapScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={rippleOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CoreMediaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-left"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <MediaToolsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={swapOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CoreEnvironmentScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomInOutOrFallback()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <FundamentalsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={20}>
          <CutFlash />
        </TransitionSeries.Overlay>

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <InterpolateScene />
        </TransitionSeries.Sequence>
        {/* springTiming() instead of linearTiming() -- any presentation can
            take either timing function; this one just demonstrates it. */}
        <TransitionSeries.Transition presentation={blurSlideOrFallback()} timing={springT} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <OutroScene logoMatrix={logoMatrix} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
