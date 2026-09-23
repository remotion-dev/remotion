import {
  TransitionSeries,
  linearTiming,
  springTiming,
  type TransitionPresentation,
} from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Captions,
  Chapters,
  Chrome,
  ComplianceCard,
  HookTitle,
  Outro,
  StatCards,
  useTyDoFont,
} from "./TyDoOverlays";
import { HookBurst, HookSfx, MoneyRain, MotionTrack } from "./TyDoMotion";
import {
  CHAPTER_TRANSITION_FRAMES,
  SEGMENTS,
  SRC,
  TALK_FRAMES,
  type Segment,
  type TransitionKind,
} from "./tyDoEdit";

const WIDTH = 1080;
const HEIGHT = 1920;
const OUTRO_FRAMES = 150;
const OUTRO_TRANSITION = 18;
// Compliance disclosures close the video, held for 5 s (the 3–5 s limit).
const COMPLIANCE_FRAMES = 150;
const COMPLIANCE_TRANSITION = 10;
const HOOK_FRAMES = 105;
export const TY_DO_DURATION =
  TALK_FRAMES + OUTRO_FRAMES - OUTRO_TRANSITION + COMPLIANCE_FRAMES - COMPLIANCE_TRANSITION;

// Widened so the five differently-typed presentations fit one <Transition> prop.
const presentation = (
  kind: TransitionKind,
): TransitionPresentation<Record<string, unknown>> => {
  switch (kind) {
    case "fade":
      return fade();
    case "slide":
      return slide({ direction: "from-right" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "flip":
      return flip({ direction: "from-right" });
    case "clockWipe":
      // clockWipe's props are required, so it only widens via unknown.
      return clockWipe({
        width: WIDTH,
        height: HEIGHT,
      }) as unknown as TransitionPresentation<Record<string, unknown>>;
  }
};

// One kept piece of the source. Alternate segments sit punched-in on the face,
// so every jump cut reads as an intentional zoom-cut, and each cut lands with a
// small spring "punch". Volume ramps 2 frames at each edge so cuts don't click.
const TalkSegment: React.FC<{ seg: Segment; index: number }> = ({
  seg,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base =
    index === 0
      ? interpolate(frame, [0, 24], [1.3, 1], { extrapolateRight: "clamp" })
      : seg.zoomed
        ? 1.13
        : 1.0;
  const punch =
    index === 0
      ? 0
      : (1 - spring({ frame, fps, config: { damping: 18, stiffness: 260 } })) *
        0.05;
  const drift = interpolate(frame, [0, seg.duration], [0, 0.02]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(SRC)}
        trimBefore={seg.srcFrom}
        trimAfter={seg.srcTo}
        volume={(f) =>
          interpolate(f, [0, 2, seg.duration - 2, seg.duration], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${base + punch + drift})`,
          transformOrigin: "50% 30%",
        }}
      />
    </AbsoluteFill>
  );
};

export const TyDoReel: React.FC = () => {
  useTyDoFont();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {SEGMENTS.map((seg, i) => (
          <React.Fragment key={seg.srcFrom}>
            <TransitionSeries.Sequence durationInFrames={seg.duration}>
              <TalkSegment seg={seg} index={i} />
            </TransitionSeries.Sequence>
            {seg.transitionAfter ? (
              <TransitionSeries.Transition
                presentation={presentation(seg.transitionAfter)}
                timing={linearTiming({
                  durationInFrames: CHAPTER_TRANSITION_FRAMES,
                })}
              />
            ) : null}
          </React.Fragment>
        ))}
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: OUTRO_TRANSITION,
          })}
        />
        <TransitionSeries.Sequence durationInFrames={OUTRO_FRAMES}>
          <Outro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: COMPLIANCE_TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={COMPLIANCE_FRAMES}>
          <ComplianceCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence durationInFrames={TALK_FRAMES - OUTRO_TRANSITION} layout="none">
        <MotionTrack />
        <Chrome talkFrames={TALK_FRAMES} />
        <StatCards />
        <Chapters />
        <Captions />
      </Sequence>
      <Sequence durationInFrames={HOOK_FRAMES}>
        <MoneyRain />
        <HookTitle />
        <HookBurst />
        <HookSfx />
      </Sequence>
    </AbsoluteFill>
  );
};

export const tyDoComposition = {
  id: "TyDoReel",
  width: WIDTH,
  height: HEIGHT,
  fps: 30,
  durationInFrames: TY_DO_DURATION,
} as const;
