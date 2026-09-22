import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {zColor, zTextarea} from "@remotion/zod-types";
import type {CalculateMetadataFunction} from "remotion";
import {AbsoluteFill} from "remotion";
import {z} from "zod";
import {TitleScene} from "./TitleScene";
import {ShapesScene} from "./ShapesScene";
import {CaptionsScene} from "./CaptionsScene";
import {RouteScene} from "./RouteScene";
import {EffectsScene} from "./EffectsScene";
import {MediaScene} from "./MediaScene";
import {AudioScene} from "./AudioScene";
import {LottieScene} from "./LottieScene";
import {ThreeScene} from "./ThreeScene";
import {GsapScene} from "./GsapScene";
import {FundamentalsScene} from "./FundamentalsScene";
import {OutroScene} from "./OutroScene";

export const fullReelSchema = z.object({
  title: z.string(),
  subtitle: zTextarea(),
  accentColor: zColor(),
});

export type FullReelProps = z.infer<typeof fullReelSchema>;

const SCENE_DURATION = 75;
const TRANSITION_DURATION = 15;
const SCENE_COUNT = 12;

export const fullReelDefaultProps: FullReelProps = {
  title: "Remotion",
  subtitle: "Every capability, one video.",
  accentColor: "#6366f1",
};

export const calculateFullReelMetadata: CalculateMetadataFunction<FullReelProps> = () => {
  const durationInFrames = SCENE_COUNT * SCENE_DURATION - (SCENE_COUNT - 1) * TRANSITION_DURATION;
  return {durationInFrames};
};

const t = linearTiming({durationInFrames: TRANSITION_DURATION});

// The single, complete demo reel: every scene from ShowcaseReel and
// ExtendedReel combined into one video (one title, one outro — the two
// reels' duplicate bookends are dropped). ~24.5s covering: spring
// animation, staggered text, rough-notation highlights (TitleScene);
// @remotion/shapes, @remotion/motion-blur, @remotion/noise (ShapesScene);
// @remotion/captions (CaptionsScene); @remotion/paths (RouteScene);
// @remotion/effects chained WebGL2 passes (EffectsScene); @remotion/media +
// @remotion/gif + @remotion/mac-cursors (MediaScene); @remotion/media-utils
// real audio waveform (AudioScene); @remotion/lottie (LottieScene);
// @remotion/three (ThreeScene); @remotion/gsap (GsapScene); core remotion
// Easing/<Series>/<Loop>/<Freeze>/random() (FundamentalsScene);
// @remotion/animation-utils + rough-notation (OutroScene).
export const FullReel: React.FC<FullReelProps> = ({title, subtitle, accentColor}) => {
  return (
    <AbsoluteFill style={{backgroundColor: "#0b1120"}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <TitleScene title={title} subtitle={subtitle} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ShapesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CaptionsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-left"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RouteScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <EffectsScene accentColor={accentColor} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-bottom"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <MediaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-top"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <AudioScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <LottieScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: "from-right"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ThreeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <GsapScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: "from-left"})} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <FundamentalsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
