import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import type {CalculateMetadataFunction} from "remotion";
import {AbsoluteFill} from "remotion";
import {TitleScene} from "./TitleScene";
import {ShapesScene} from "./ShapesScene";
import {CaptionsScene} from "./CaptionsScene";
import {RouteScene} from "./RouteScene";
import {OutroScene} from "./OutroScene";

export type ShowcaseReelProps = {
  title: string;
  subtitle: string;
};

// Every scene's length and every transition's length live here, so the
// total duration is computed rather than hand-counted (see calculateMetadata
// below) — the same pattern the remotion-markup calculate-metadata guide
// recommends for data-driven duration.
const SCENE_DURATION = 75;
const TRANSITION_DURATION = 15;
const SCENE_COUNT = 5;

export const showcaseReelDefaultProps: ShowcaseReelProps = {
  title: "Remotion",
  subtitle: "One skill. Every capability.",
};

export const calculateShowcaseReelMetadata: CalculateMetadataFunction<ShowcaseReelProps> = () => {
  const durationInFrames =
    SCENE_COUNT * SCENE_DURATION - (SCENE_COUNT - 1) * TRANSITION_DURATION;

  return {durationInFrames};
};

// A short demo reel exercising several Remotion capabilities end to end:
// TransitionSeries scene transitions, @remotion/shapes + spring animation,
// @remotion/motion-blur, @remotion/noise, @remotion/rough-notation,
// @remotion/captions, and @remotion/paths. Text uses font.ts's system font
// stack, not @remotion/google-fonts: Google Fonts can't load inside this
// sandbox's renderer (see font.ts).
// See my-video/.claude/skills/remotion-best-practices/SKILL.md for the
// guide each scene follows.
export const ShowcaseReel: React.FC<ShowcaseReelProps> = ({title, subtitle}) => {
  return (
    <AbsoluteFill style={{backgroundColor: "#0b1120"}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <TitleScene title={title} subtitle={subtitle} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <ShapesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({direction: "from-right"})}
          timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <CaptionsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({direction: "from-left"})}
          timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <RouteScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
        />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <OutroScene logoMatrix={null} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
