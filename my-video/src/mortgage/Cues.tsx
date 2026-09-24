// Motion-graphics cues from edit.json, plus the film finish, chapter light
// leaks and the sound-design track. Every cue and every beat inside it is keyed
// to SOURCE ms and remapped through the cut list, so beats stay locked to the
// speech however the silences were trimmed and the pace changed. The panel
// infographics (kinetic, compare, bars) live in Infographics.tsx.
import { Audio } from "@remotion/media";
import type React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LenderRow } from "../brand/LenderRow";
import { NotoEmoji } from "../brand/NotoEmoji";
import { brand } from "../brand/theme";
import { FilmFinish, LeakFlash } from "./Frame";
import {
  Bars,
  Compare,
  Kinetic,
  Panel,
  useExit,
  type CueOf,
  type Rel,
} from "./Infographics";
import { outFrameOf, type Cue, type Reel } from "./schema";
import { FONT, clamp, pop } from "./style";

// ---------------------------------------------------------------- verdict

const Verdict: React.FC<{ cue: CueOf<"verdict"> }> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(8);
  const color = cue.ok ? brand.good : brand.bad;
  const len = 260;
  const stroke = (a: number) =>
    len * (1 - interpolate(frame, [a, a + 12], [0, 1], clamp));
  const mark = (d: string, at: number) => (
    <path
      d={d}
      stroke={color}
      strokeWidth={24}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={len}
      strokeDashoffset={stroke(at)}
    />
  );
  return (
    <AbsoluteFill
      style={{ alignItems: "center", paddingTop: 160, opacity: 1 - exit }}
    >
      <svg
        width={300}
        height={300}
        viewBox="0 0 300 300"
        style={{ transform: `scale(${pop(frame, fps, 0)})` }}
      >
        <circle
          cx={150}
          cy={150}
          r={130}
          fill="rgba(11,31,61,0.9)"
          stroke={color}
          strokeWidth={14}
        />
        {cue.ok ? (
          mark("M85 155 L130 200 L215 105", 2)
        ) : (
          <>
            {mark("M95 95 L205 205", 2)}
            {mark("M205 95 L95 205", 8)}
          </>
        )}
      </svg>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          color: "#fff",
          background: color,
          padding: "8px 30px",
          borderRadius: 14,
          marginTop: 16,
          maxWidth: 980,
          textAlign: "center",
          transform: `scale(${pop(frame, fps, 6)})`,
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- venn

const Venn: React.FC<{ cue: CueOf<"venn"> }> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  const join = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const left = (side: -1 | 1) =>
    540 - 150 + side * interpolate(join, [0, 1], [420, 95]);
  const circle = (side: -1 | 1, color: string) => (
    <div
      style={{
        position: "absolute",
        left: left(side),
        top: 0,
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: `${color}CC`,
        border: `4px solid ${brand.accent}`,
      }}
    />
  );
  // Labels sit on the outer, non-overlapping part of each circle, drawn above
  // both, sized so the longest word fits the 128px lune ("Broker" at 38px).
  const label = (text: string, side: -1 | 1) => (
    <div
      style={{
        position: "absolute",
        left: left(side) + (side < 0 ? 22 : 150),
        top: 122,
        width: 128,
        textAlign: "center",
        fontSize: Math.min(
          46,
          Math.floor(230 / Math.max(...text.split(" ").map((w) => w.length))),
        ),
        lineHeight: 1.1,
        fontWeight: 900,
        color: "#fff",
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ top: 150, fontFamily: FONT, opacity: 1 - exit }}>
      {circle(-1, brand.primary)}
      {circle(1, brand.accent)}
      {label(cue.left, -1)}
      {label(cue.right, 1)}
      <div
        style={{
          position: "absolute",
          top: 320,
          width: "100%",
          textAlign: "center",
          fontSize: 66,
          fontWeight: 900,
          color: brand.highlight,
          textShadow: "0 4px 0 #000, 0 0 20px rgba(0,0,0,0.8)",
          transform: `scale(${pop(frame, fps, 22)})`,
        }}
      >
        {cue.label}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- emoji / lenders

const Emoji: React.FC<{ cue: CueOf<"emoji"> }> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(6);
  const p = pop(frame, fps, 0);
  return (
    <div
      style={{
        position: "absolute",
        top: 520,
        [cue.position === "left" ? "left" : "right"]: 60,
        opacity: 1 - exit,
        transform: `scale(${p})`,
      }}
    >
      <NotoEmoji name={cue.name} size={240} loop />
    </div>
  );
};

const Lenders: React.FC<{ cue: CueOf<"lenders"> }> = ({ cue }) => (
  <Panel style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: 52,
        fontWeight: 900,
        color: brand.highlight,
        marginBottom: 24,
      }}
    >
      {cue.title ?? "Các ngân hàng Finance Hub làm việc cùng"}
    </div>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <LenderRow height={50} />
    </div>
  </Panel>
);

const CueView: React.FC<{ cue: Cue; rel: Rel }> = ({ cue, rel }) => {
  switch (cue.kind) {
    case "kinetic":
      return <Kinetic cue={cue} rel={rel} />;
    case "compare":
      return <Compare cue={cue} rel={rel} />;
    case "bars":
      return <Bars cue={cue} rel={rel} />;
    case "verdict":
      return <Verdict cue={cue} />;
    case "venn":
      return <Venn cue={cue} />;
    case "emoji":
      return <Emoji cue={cue} />;
    case "lenders":
      return <Lenders cue={cue} />;
  }
};

// ---------------------------------------------------------------- sound design

type Sfx = { atMs: number; file: string; volume: number };

// Derived from the edit, so a new video gets the same sound design for free.
const sfxFor = (reel: Reel): Sfx[] => [
  ...(reel.edit.chapters ?? []).map((c) => ({
    atMs: c.atMs - 250,
    file: "whoosh",
    volume: 0.35,
  })),
  ...(reel.edit.stats ?? []).map((c) => ({
    atMs: c.atMs,
    file: "ding",
    volume: 0.22,
  })),
  ...(reel.edit.cues ?? []).flatMap((c): Sfx[] => {
    switch (c.kind) {
      case "kinetic":
        return [{ atMs: c.slam.atMs, file: "whip", volume: 0.4 }];
      case "compare":
        return c.cards.map((k) => ({
          atMs: k.atMs,
          file: "mouse-click",
          volume: 0.5,
        }));
      case "bars":
        return c.stamp
          ? [{ atMs: c.stamp.atMs, file: "shutter-modern", volume: 0.35 }]
          : [];
      case "verdict":
        return [{ atMs: c.fromMs, file: "vine-boom", volume: 0.3 }];
      case "venn":
        return [{ atMs: c.fromMs + 700, file: "whoosh", volume: 0.3 }];
      default:
        return [];
    }
  }),
];

export const MotionTrack: React.FC<{ reel: Reel }> = ({ reel }) => {
  const { fps } = useVideoConfig();
  const outFrame = outFrameOf(reel.timeline, fps);
  return (
    <>
      <FilmFinish />
      {(reel.edit.cues ?? []).map((c) => {
        const from = outFrame(c.fromMs);
        return (
          <Sequence
            key={`${c.kind}${c.fromMs}`}
            from={from}
            durationInFrames={Math.max(1, outFrame(c.toMs) - from)}
            layout="none"
          >
            <CueView cue={c} rel={(ms) => outFrame(ms) - from} />
          </Sequence>
        );
      })}
      {/* One WebGL light leak per chapter cut; at most one mounted at a time. */}
      {(reel.edit.chapters ?? []).map((c, i) => (
        <Sequence
          key={c.atMs}
          from={Math.max(0, outFrame(c.atMs) - 12)}
          durationInFrames={26}
          layout="none"
        >
          <LeakFlash seed={i + 2} />
        </Sequence>
      ))}
      {sfxFor(reel).map((s) => (
        <Sequence
          key={`${s.file}${s.atMs}`}
          from={Math.max(0, outFrame(s.atMs))}
          durationInFrames={fps * 3}
          layout="none"
        >
          <Audio
            src={staticFile(`sfx/${s.file}.wav`)}
            volume={() => s.volume}
          />
        </Sequence>
      ))}
    </>
  );
};
