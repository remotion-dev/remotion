// Motion-graphics cues from edit.json (kinetic type, product compare, bar chart,
// verdict, win-win circles, emoji, lenders), plus the film finish, chapter light
// leaks and the sound-design track. Every cue and every beat inside it is keyed
// to SOURCE ms and remapped through the cut list, so beats stay locked to the
// speech however the silences were trimmed and the pace changed.
import { Audio } from "@remotion/media";
import { StrikeThrough } from "@remotion/rough-notation";
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
import { outFrameOf, type Cue, type Reel } from "./schema";
import { DIM, FONT, clamp, pop, toneColor } from "./style";

type CueOf<K extends Cue["kind"]> = Extract<Cue, { kind: K }>;
// Frame offset of a source moment relative to the start of the cue.
type Rel = (srcMs: number) => number;

const useExit = (frames = 10) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(
    frame,
    [durationInFrames - frames, durationInFrames],
    [0, 1],
    clamp,
  );
};

// Navy glass card that drops in from the top and flies back out at the end.
const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  const inP = pop(frame, fps, 0);
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 50,
        right: 50,
        padding: "34px 36px",
        borderRadius: 34,
        background:
          "linear-gradient(160deg, rgba(0,100,168,0.96), rgba(11,31,61,0.96))",
        border: `3px solid ${brand.accent}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        fontFamily: FONT,
        color: "#fff",
        transform: `translateY(${interpolate(inP, [0, 1], [-700, 0]) - exit * 800}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity,
}) => (
  <div
    style={{
      fontSize: 36,
      letterSpacing: 6,
      color: brand.accent,
      fontWeight: 900,
      opacity,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------- kinetic type

// "Not X, not Y" struck through one by one, then the real point slams in.
const Kinetic: React.FC<{ cue: CueOf<"kinetic">; rel: Rel }> = ({
  cue,
  rel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = rel(cue.slam.atMs);
  const oldOut = interpolate(frame, [slam - 4, slam + 4], [1, 0], clamp);
  const slamP = pop(frame, fps, slam);
  return (
    <Panel style={{ textAlign: "center", minHeight: 360 }}>
      {frame < slam + 4 ? (
        <>
          {cue.kicker ? <Kicker opacity={oldOut}>{cue.kicker}</Kicker> : null}
          {cue.struck.map((s) => {
            const strikeAt = rel(s.strikeMs);
            return (
              <div
                key={s.text}
                style={{
                  opacity: pop(frame, fps, rel(s.atMs)) * oldOut,
                  fontSize: 64,
                  fontWeight: 800,
                  margin: "8px 0",
                }}
              >
                <StrikeThrough
                  progress={interpolate(
                    frame,
                    [strikeAt, strikeAt + 8],
                    [0, 1],
                    clamp,
                  )}
                  color={brand.bad}
                  strokeWidth={7}
                >
                  <span style={{ color: DIM }}>{s.text}</span>
                </StrikeThrough>
              </div>
            );
          })}
        </>
      ) : (
        <>
          {cue.slam.kicker ? <Kicker>{cue.slam.kicker}</Kicker> : null}
          <div
            style={{
              fontSize: cue.slam.text.length > 14 ? 96 : 120,
              fontWeight: 900,
              color: brand.highlight,
              lineHeight: 1.05,
              transform: `scale(${interpolate(slamP, [0, 1], [3, 1])})`,
              opacity: slamP,
              textShadow: "0 0 40px rgba(255,185,56,0.45)",
            }}
          >
            {cue.slam.text}
          </div>
          {cue.sub ? (
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                marginTop: 14,
                opacity: pop(frame, fps, rel(cue.sub.atMs)),
              }}
            >
              {cue.sub.text}
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
};

// ---------------------------------------------------------------- compare

const Row: React.FC<{
  at: number;
  label: string;
  value: string;
  color: string;
}> = ({ at, label, value, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontSize: 36,
        fontWeight: 600,
        padding: "10px 0",
        borderTop: "2px solid rgba(255,255,255,0.12)",
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
      }}
    >
      <span style={{ color: DIM }}>{label}</span>
      <span style={{ fontWeight: 900, color, whiteSpace: "nowrap" }}>
        {value}
      </span>
    </div>
  );
};

const Compare: React.FC<{ cue: CueOf<"compare">; rel: Rel }> = ({
  cue,
  rel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vs = pop(frame, fps, rel(cue.vsAtMs ?? cue.cards[1].atMs));
  const qP = cue.question ? pop(frame, fps, rel(cue.question.atMs)) : 0;
  return (
    <Panel style={{ padding: 26 }}>
      <div style={{ display: "flex", gap: 22, position: "relative" }}>
        {cue.cards.map((card) => {
          const p = pop(frame, fps, rel(card.atMs));
          const lit =
            card.highlightAtMs !== undefined &&
            frame > rel(card.highlightAtMs);
          return (
            <div
              key={card.title}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "22px 24px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.06)",
                border: `3px solid ${lit ? brand.highlight : "rgba(255,255,255,0.18)"}`,
                opacity: p,
                transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: brand.highlight,
                  marginBottom: 8,
                }}
              >
                {card.title}
              </div>
              {card.rows.map((r) => (
                <Row
                  key={r.label}
                  at={rel(r.atMs)}
                  label={r.label}
                  value={r.value}
                  color={toneColor(r.tone, "#fff")}
                />
              ))}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 120,
            width: 96,
            height: 96,
            marginLeft: -48,
            borderRadius: "50%",
            background: brand.accent,
            color: brand.primary,
            fontSize: 42,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${vs}) rotate(${interpolate(vs, [0, 1], [-180, 0])}deg)`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          VS
        </div>
      </div>
      {cue.question ? (
        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontSize: 50,
            fontWeight: 900,
            color: brand.highlight,
            opacity: qP,
            transform: `scale(${qP * (1 + Math.sin(frame / 5) * 0.04)})`,
          }}
        >
          {cue.question.text}
        </div>
      ) : null}
    </Panel>
  );
};

// ---------------------------------------------------------------- bars

const BAR_MAX = 300;
const OVERFLOW_ROOM = 70;

const Bar: React.FC<{
  bar: CueOf<"bars">["bars"][number];
  at: number;
  width: number;
}> = ({ bar, at, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = toneColor(bar.tone);
  const g = spring({
    frame: frame - at,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  // An overflowing bar punches through the chart top (into the headroom Bars
  // reserves for it) and keeps pulsing.
  const h = bar.overflow
    ? BAR_MAX + OVERFLOW_ROOM - 12 + Math.sin(frame / 4) * 8
    : Math.max(bar.height * BAR_MAX, 60);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width,
      }}
    >
      <div
        style={{
          height: BAR_MAX,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: 170,
            height: h * g,
            background: `linear-gradient(180deg, ${color}, ${color}99)`,
            borderRadius: bar.overflow ? "0 0 4px 4px" : "16px 16px 4px 4px",
            boxShadow: `0 0 30px ${color}66`,
            display: "flex",
            justifyContent: "center",
            paddingTop: 10,
            fontSize: 44,
            fontWeight: 900,
            color: brand.background,
            clipPath: bar.overflow
              ? "polygon(0 14px, 12% 0, 25% 14px, 38% 0, 50% 14px, 62% 0, 75% 14px, 88% 0, 100% 14px, 100% 100%, 0 100%)"
              : undefined,
          }}
        >
          {g > 0.6 ? bar.value : ""}
        </div>
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginTop: 12,
          textAlign: "center",
          lineHeight: 1.3,
          opacity: g,
        }}
      >
        {bar.label}
      </div>
    </div>
  );
};

const Stamp: React.FC<{ at: number; text: string; color: string }> = ({
  at,
  text,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const p = pop(frame, fps, at);
  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 30,
        padding: "10px 26px",
        border: `6px solid ${color}`,
        borderRadius: 18,
        color,
        fontSize: 48,
        fontWeight: 900,
        transform: `rotate(-10deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`,
        opacity: p,
        background: "rgba(11,31,61,0.85)",
      }}
    >
      {text}
    </div>
  );
};

const Bars: React.FC<{ cue: CueOf<"bars">; rel: Rel }> = ({ cue, rel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = pop(frame, fps, 0);
  const n = cue.bars.length;
  return (
    <Panel style={{ minHeight: 560 }}>
      {cue.kicker ? (
        <div
          style={{ fontSize: 40, fontWeight: 700, color: DIM, opacity: title }}
        >
          {cue.kicker}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: brand.highlight,
          lineHeight: 1,
          opacity: title,
        }}
      >
        {cue.title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: n > 2 ? 20 : 60,
          marginTop: cue.bars.some((b) => b.overflow) ? 30 + OVERFLOW_ROOM : 30,
        }}
      >
        {cue.bars.map((b) => (
          <Bar key={b.label} bar={b} at={rel(b.atMs)} width={n > 2 ? 270 : 300} />
        ))}
      </div>
      {cue.stamp ? (
        <Stamp
          at={rel(cue.stamp.atMs)}
          text={cue.stamp.text}
          color={toneColor(cue.stamp.tone)}
        />
      ) : null}
    </Panel>
  );
};

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
