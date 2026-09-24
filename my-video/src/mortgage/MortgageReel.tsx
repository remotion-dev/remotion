// MortgageReel: the reusable FinHub talking-head template. Per video, only
// public/videos/<slug>/{source.mp4, words.json, edit.json} change; this code
// doesn't. calculateMetadata loads the edit, enforces ASIC RG 234 on every
// on-screen string (the render FAILS rather than ship a non-compliant claim),
// builds the paced timeline and hands it to the component as props.
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
  type CalculateMetadataFunction,
} from "remotion";
import { z } from "zod";
import { Captions, Chapters, StatCards } from "./Captions";
import { assertCompliantCopy, assertRateGate } from "./compliance";
import { MotionTrack } from "./Cues";
import {
  Chrome,
  ComplianceCard,
  Cover,
  HookBurst,
  HookSfx,
  HookTitle,
  MoneyRain,
  Outro,
} from "./Frame";
import {
  DEFAULT_CTA_QUESTION,
  DEFAULT_SUBTITLE,
  onScreenCopy,
  parseEdit,
  type Reel,
} from "./schema";
import { KEYWORDS, retryVideoFetch, useReelFont } from "./style";
import {
  CHAPTER_TRANSITION_FRAMES,
  COVER_FRAMES,
  COVER_TRANSITION_FRAMES,
  TALK_START_FRAME,
  buildTimeline,
  type Segment,
  type TransitionKind,
  type Word,
} from "./timeline";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const OUTRO_FRAMES = 150;
const OUTRO_TRANSITION = 18;
// Compliance disclosures close the video, held for 5 s.
const COMPLIANCE_FRAMES = 150;
const COMPLIANCE_TRANSITION = 10;
const HOOK_FRAMES = 105;
const DEFAULT_COVER_FRAME_MS = 1500;

export const mortgageReelSchema = z.object({ slug: z.string() });
export type MortgageReelProps = z.infer<typeof mortgageReelSchema> & {
  reel: Reel | null;
};

const fetchJson = async (slug: string, file: string): Promise<unknown> => {
  const path = `videos/${slug}/${file}`;
  const res = await fetch(staticFile(path));
  if (!res.ok)
    throw new Error(
      `MortgageReel "${slug}": public/${path} not found (HTTP ${res.status}). ` +
        `Run scripts/prep-video.py <video> ${slug} first, then write edit.json.`,
    );
  return res.json();
};

export const calculateMortgageReelMetadata: CalculateMetadataFunction<
  MortgageReelProps
> = async ({ props }) => {
  const { slug } = props;
  const [editJson, words] = await Promise.all([
    fetchJson(slug, "edit.json"),
    fetchJson(slug, "words.json"),
  ]);
  const edit = parseEdit(editJson, slug);
  if (!Array.isArray(words) || words.length === 0)
    throw new Error(`public/videos/${slug}/words.json has no words.`);
  // Throws "RG 234: restricted terminology found" and fails the render.
  assertCompliantCopy(onScreenCopy(edit), edit.exemptions ?? []);
  const rate = edit.compliance?.advertisedRate;
  if (rate)
    assertRateGate(rate.rateFigure, rate.comparisonRate, rate.ratesAsAt);
  const timeline = buildTimeline(words as Word[], edit, FPS);
  return {
    durationInFrames:
      TALK_START_FRAME +
      timeline.talkFrames +
      OUTRO_FRAMES -
      OUTRO_TRANSITION +
      COMPLIANCE_FRAMES -
      COMPLIANCE_TRANSITION,
    defaultOutName: slug,
    props: { slug, reel: { edit, timeline } },
  };
};

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

// One kept piece of the source, played at its pacing rate. Alternate segments
// sit punched-in on the face, so every jump cut reads as an intentional
// zoom-cut, and each cut lands with a small spring "punch". Volume ramps 2
// frames at each edge so cuts don't click.
// Only trimBefore is set: <OffthreadVideo>'s trimAfter is applied as a timeline
// duration (trimAfter - trimBefore frames), not scaled by playbackRate, so at a
// rate below 1 it would blank the segment's tail. The enclosing sequence of
// outDuration frames ends playback at srcFrom + outDuration * rate ≈ srcTo.
const TalkSegment: React.FC<{ seg: Segment; index: number; src: string }> = ({
  seg,
  index,
  src,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = seg.outDuration;
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
  const drift = interpolate(frame, [0, dur], [0, 0.02]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={src}
        trimBefore={seg.srcFrom}
        playbackRate={seg.rate}
        {...retryVideoFetch}
        volume={(f) =>
          interpolate(f, [0, 2, dur - 2, dur], [0, 1, 1, 0], {
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

export const MortgageReel: React.FC<MortgageReelProps> = ({ slug, reel }) => {
  useReelFont();
  if (!reel) throw new Error("MortgageReel: calculateMetadata did not run.");
  const { edit, timeline } = reel;
  const src = staticFile(`videos/${slug}/source.mp4`);
  const keywords = [...KEYWORDS, ...(edit.keywords ?? [])];
  const talk = timeline.talkFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={COVER_FRAMES}>
          <Cover
            src={src}
            coverFrame={Math.round(
              ((edit.coverFrameMs ?? DEFAULT_COVER_FRAME_MS) * FPS) / 1000,
            )}
            title={edit.title}
            subtitle={edit.subtitle ?? DEFAULT_SUBTITLE}
            keywords={keywords}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: COVER_TRANSITION_FRAMES })}
        />
        {timeline.segments.map((seg, i) => (
          <React.Fragment key={seg.srcFrom}>
            <TransitionSeries.Sequence durationInFrames={seg.outDuration}>
              <TalkSegment seg={seg} index={i} src={src} />
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
          <Outro question={edit.cta?.question ?? DEFAULT_CTA_QUESTION} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: COMPLIANCE_TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={COMPLIANCE_FRAMES}>
          <ComplianceCard compliance={edit.compliance} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence
        from={TALK_START_FRAME}
        durationInFrames={talk - OUTRO_TRANSITION}
        layout="none"
      >
        <MotionTrack reel={reel} />
        <Chrome talkFrames={talk} />
        <StatCards reel={reel} />
        <Chapters reel={reel} />
        <Captions reel={reel} keywords={keywords} />
      </Sequence>
      {edit.hook ? (
        <Sequence from={TALK_START_FRAME} durationInFrames={HOOK_FRAMES}>
          <MoneyRain />
          <HookTitle hook={edit.hook} />
          <HookBurst />
          <HookSfx />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const mortgageReelComposition = {
  id: "MortgageReel",
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  durationInFrames: 300, // replaced by calculateMortgageReelMetadata
} as const;
