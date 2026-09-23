import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {zColor, zTextarea} from "@remotion/zod-types";
import type {CalculateMetadataFunction} from "remotion";
import {AbsoluteFill} from "remotion";
import {z} from "zod";
import {TitleScene} from "./TitleScene";
import {OutroScene} from "./OutroScene";
import {EffectsScene} from "./EffectsScene";
import {MediaScene} from "./MediaScene";
import {AudioScene} from "./AudioScene";
import {LottieScene} from "./LottieScene";
import {ThreeScene} from "./ThreeScene";
import {ThreeTextScene} from "./ThreeTextScene";
import {GsapScene} from "./GsapScene";
import {FundamentalsScene} from "./FundamentalsScene";
import {InterpolateScene} from "./InterpolateScene";
import {VideoMattingScene} from "./VideoMattingScene";
import {BrowserTranscriptionScene} from "./BrowserTranscriptionScene";
import {AnimatedEmojiScene} from "./AnimatedEmojiScene";
import {SkiaScene} from "./SkiaScene";
import {RiveScene} from "./RiveScene";
import {RoundedTextBoxScene} from "./RoundedTextBoxScene";
import {SfxScene} from "./SfxScene";
import {CoreMediaScene} from "./CoreMediaScene";
import {CoreEnvironmentScene} from "./CoreEnvironmentScene";
import {canvasCircleRevealOrFallback} from "./htmlInCanvasPresentation";

// A zod schema (vs. ShowcaseReel's plain `type`) gets Studio-generated,
// validated controls: zTextarea() for a multi-line field, zColor() for a
// color picker. See remotion-markup/parameters.md.
export const extendedReelSchema = z.object({
  title: z.string(),
  subtitle: zTextarea(),
  accentColor: zColor(),
});

export type ExtendedReelProps = z.infer<typeof extendedReelSchema>;

const SCENE_DURATION = 75;
const TRANSITION_DURATION = 15;
const SCENE_COUNT = 20;

export const extendedReelDefaultProps: ExtendedReelProps = {
  title: "Remotion, extended",
  subtitle: "The capabilities the first reel missed.",
  accentColor: "#6366f1",
};

export const calculateExtendedReelMetadata: CalculateMetadataFunction<ExtendedReelProps> = () => {
  const durationInFrames = SCENE_COUNT * SCENE_DURATION - (SCENE_COUNT - 1) * TRANSITION_DURATION;
  // calculateMetadata() can set more than the duration: these become the
  // CLI's defaults for this composition, and scenes can read them back from
  // useVideoConfig() (CoreEnvironmentScene does).
  return {durationInFrames, defaultCodec: "h264", defaultOutName: "extended-reel"};
};

const transitionTiming = linearTiming({durationInFrames: TRANSITION_DURATION});

// A second reel covering the capabilities the first ShowcaseReel didn't
// touch: @remotion/effects (chained WebGL2 passes), @remotion/media +
// @remotion/gif + @remotion/preload + @remotion/mac-cursors (real
// embedded/cropped/preloaded footage), @remotion/video-matting (AI
// background removal), @remotion/media-utils (a real audio waveform),
// @remotion/whisper-webgpu (in-browser transcription), @remotion/lottie,
// @remotion/animated-emoji, @remotion/three (a rotating mesh, then a second
// scene of real extruded 3D typography), @remotion/skia, @remotion/rive
// (API surface only -- see RiveScene's own comment for why), @remotion/
// layout-utils + @remotion/rounded-text-box + @remotion/fonts,
// @remotion/sfx, @remotion/gsap, core remotion's media/canvas components
// (CoreMediaScene) and environment/introspection APIs (CoreEnvironmentScene),
// core remotion fundamentals (Easing, <Series>, <Loop>, <Freeze>,
// random()), and every interpolate() option (InterpolateScene).
export const ExtendedReel: React.FC<ExtendedReelProps> = ({title, subtitle, accentColor}) => {
  return (
    <AbsoluteFill style={{backgroundColor: "#0b1120"}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <TitleScene title={title} subtitle={subtitle} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <EffectsScene accentColor={accentColor} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <MediaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-left"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <VideoMattingScene />
        </TransitionSeries.Sequence>
        {/* A custom makeHtmlInCanvasPresentation() shader; renders as its fade()
            fallback wherever HtmlInCanvas isn't supported, as here. */}
        <TransitionSeries.Transition presentation={canvasCircleRevealOrFallback()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <AudioScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-left"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <BrowserTranscriptionScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <LottieScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-bottom"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <AnimatedEmojiScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ThreeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ThreeTextScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <SkiaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-bottom"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RiveScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RoundedTextBoxScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <SfxScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-left"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <GsapScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-top"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CoreMediaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CoreEnvironmentScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-bottom"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <FundamentalsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <InterpolateScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <OutroScene logoMatrix={null} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
