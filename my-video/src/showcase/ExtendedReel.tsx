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
import {GsapScene} from "./GsapScene";
import {FundamentalsScene} from "./FundamentalsScene";
import {VideoMattingScene} from "./VideoMattingScene";
import {BrowserTranscriptionScene} from "./BrowserTranscriptionScene";

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
const SCENE_COUNT = 11;

export const extendedReelDefaultProps: ExtendedReelProps = {
  title: "Remotion, extended",
  subtitle: "The capabilities the first reel missed.",
  accentColor: "#6366f1",
};

export const calculateExtendedReelMetadata: CalculateMetadataFunction<ExtendedReelProps> = () => {
  const durationInFrames = SCENE_COUNT * SCENE_DURATION - (SCENE_COUNT - 1) * TRANSITION_DURATION;
  return {durationInFrames};
};

const transitionTiming = linearTiming({durationInFrames: TRANSITION_DURATION});

// A second reel covering the capabilities the first ShowcaseReel didn't
// touch: @remotion/effects (chained WebGL2 passes), @remotion/media +
// @remotion/gif + @remotion/mac-cursors (real embedded/cropped footage),
// @remotion/video-matting (AI background removal), @remotion/media-utils
// (a real audio waveform), @remotion/whisper-webgpu (in-browser
// transcription), @remotion/lottie, @remotion/three, @remotion/gsap, and
// core remotion fundamentals (Easing, <Series>, <Loop>, <Freeze>,
// random()).
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
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

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
          <ThreeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <GsapScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-top"})} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <FundamentalsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
