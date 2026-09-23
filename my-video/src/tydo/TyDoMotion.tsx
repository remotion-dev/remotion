// Motion-graphics layer for TyDoReel (rendered with --gl=angle for the WebGL
// effects): infographics synced to the words that
// introduce them, a kinetic-type interrupt, money rain + starburst on the hook,
// WebGL light leaks on chapter cuts, film grain, and a sound-design track.
// Every cue is keyed to SOURCE ms and remapped through the cut list, so beats
// stay locked to the speech however the silences were trimmed.
import { AnimatedEmoji } from "@remotion/animated-emoji";
import { lightLeak } from "@remotion/effects/light-leak";
import { starburst } from "@remotion/effects/starburst";
import { Audio } from "@remotion/media";
import { StrikeThrough } from "@remotion/rough-notation";
import type React from "react";
import {
  AbsoluteFill,
  Sequence,
  Solid,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, ACCENT, BLUE } from "./TyDoOverlays";
import { CHAPTERS, FPS, STAT_CARDS, toOutMs } from "./tyDoEdit";

const HIGHLIGHT = "#FFB938";
const GREEN = "#3DDC97";
const RED = "#FF5A5F";

const outFrame = (srcMs: number) =>
  Math.round(((toOutMs(srcMs) ?? 0) / 1000) * FPS);
// Frame offset of a later source moment, relative to a cue that starts at `cueMs`.
const rel = (cueMs: number, srcMs: number) => outFrame(srcMs) - outFrame(cueMs);

const pop = (frame: number, fps: number, at: number) =>
  spring({
    frame: frame - at,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
  });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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
  exit: number;
  style?: React.CSSProperties;
}> = ({ children, exit, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
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
        border: `3px solid ${ACCENT}`,
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

// ---------------------------------------------------------------- hook

export const MoneyRain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {new Array(34).fill(0).map((_, i) => {
        const delay = random(`d${i}`) * 30;
        if (frame < delay) return null;
        const x = random(`x${i}`) * 1080;
        const speed = 18 + random(`s${i}`) * 22;
        const size = 46 + random(`z${i}`) * 60;
        const rot = (frame - delay) * (random(`r${i}`) * 8 - 4);
        const isCoin = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: -120 + (frame - delay) * speed,
              width: size,
              height: size,
              transform: `rotate(${rot}deg)`,
              borderRadius: isCoin ? "50%" : 8,
              background: isCoin
                ? `radial-gradient(circle at 35% 35%, #FFE89A, ${ACCENT} 60%, #8A6A1E)`
                : "#2E8B57",
              border: isCoin ? "3px solid #8A6A1E" : "3px solid #1E5E3A",
              color: isCoin ? "#6B4E10" : "#CFF5DD",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size * 0.55,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.9,
              boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            }}
          >
            $
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Rotating gold starburst behind the hook counter (WebGL, screen-blended).
export const HookBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 8, durationInFrames - 12, durationInFrames],
    [0, 0.55, 0.55, 0],
    clamp,
  );
  return (
    <Solid
      color="#000000"
      width={1080}
      height={760}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        mixBlendMode: "screen",
        opacity,
      }}
      effects={[
        starburst({
          rays: 16,
          colors: [ACCENT, "#0B1F3D"],
          rotation: frame * 1.2,
          smoothness: 0.35,
          origin: [0.5, 0.3],
        }),
      ]}
    />
  );
};

// ---------------------------------------------------------------- kinetic type

const KineticCost: React.FC<{ cueMs: number }> = ({ cueMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  const slam = rel(cueMs, 34280);
  const oldOut = interpolate(frame, [slam - 4, slam + 4], [1, 0], clamp);
  const slamP = pop(frame, fps, slam);
  const line = (at: number, strikeAt: number, text: string) => (
    <div
      style={{
        opacity: pop(frame, fps, at) * oldOut,
        fontSize: 64,
        fontWeight: 800,
        margin: "8px 0",
      }}
    >
      <StrikeThrough
        progress={interpolate(frame, [strikeAt, strikeAt + 8], [0, 1], clamp)}
        color={RED}
        strokeWidth={7}
      >
        <span style={{ color: "#C9D3E6" }}>{text}</span>
      </StrikeThrough>
    </div>
  );
  return (
    <Panel exit={exit} style={{ textAlign: "center", minHeight: 360 }}>
      {frame < slam + 4 ? (
        <>
          <div
            style={{
              fontSize: 36,
              letterSpacing: 6,
              color: ACCENT,
              fontWeight: 900,
              opacity: oldOut,
            }}
          >
            KHÔNG CHỈ LÀ
          </div>
          {line(rel(cueMs, 31040), rel(cueMs, 31700), "Lệ phí thấp nhất")}
          {line(rel(cueMs, 32680), rel(cueMs, 33700), "Lãi suất rẻ nhất")}
        </>
      ) : (
        <>
          <div
            style={{
              fontSize: 36,
              letterSpacing: 6,
              color: ACCENT,
              fontWeight: 900,
            }}
          >
            MÀ LÀ
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: HIGHLIGHT,
              lineHeight: 1.05,
              transform: `scale(${interpolate(slamP, [0, 1], [3, 1])})`,
              opacity: slamP,
              textShadow: "0 0 40px rgba(255,185,56,0.45)",
            }}
          >
            TỔNG CHI PHÍ
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              marginTop: 14,
              opacity: pop(frame, fps, rel(cueMs, 37260)),
            }}
          >
            phù hợp với bạn
          </div>
        </>
      )}
    </Panel>
  );
};

// ---------------------------------------------------------------- product vs product

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
        fontSize: 36,
        fontWeight: 600,
        padding: "10px 0",
        borderTop: "2px solid rgba(255,255,255,0.12)",
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
      }}
    >
      <span style={{ color: "#C9D3E6" }}>{label}</span>
      <span style={{ fontWeight: 900, color }}>{value}</span>
    </div>
  );
};

const ProductCard: React.FC<{
  at: number;
  title: string;
  highlight: boolean;
  children: React.ReactNode;
}> = ({ at, title, highlight, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  return (
    <div
      style={{
        flex: 1,
        padding: "22px 24px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.06)",
        border: `3px solid ${highlight ? HIGHLIGHT : "rgba(255,255,255,0.18)"}`,
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: HIGHLIGHT,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

const VsProducts: React.FC<{ cueMs: number }> = ({ cueMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  const right = rel(cueMs, 58800);
  const vs = pop(frame, fps, right);
  const qP = pop(frame, fps, rel(cueMs, 71500));
  return (
    <Panel exit={exit} style={{ padding: 26 }}>
      <div style={{ display: "flex", gap: 22, position: "relative" }}>
        <ProductCard at={0} title="GÓI BASIC" highlight={false}>
          <Row
            at={rel(cueMs, 51060)}
            label="Phí tháng"
            value="$0"
            color={GREEN}
          />
          <Row
            at={rel(cueMs, 52060)}
            label="Phí năm"
            value="$0"
            color={GREEN}
          />
          <Row
            at={rel(cueMs, 56560)}
            label="Lãi suất"
            value="+0,4%"
            color={RED}
          />
        </ProductCard>
        <ProductCard
          at={right}
          title="GÓI CÓ PHÍ"
          highlight={frame > rel(cueMs, 65720)}
        >
          <Row
            at={rel(cueMs, 62060)}
            label="Phí năm"
            value="$400"
            color={RED}
          />
          <Row
            at={rel(cueMs, 65720)}
            label="Lãi suất"
            value="−0,4%"
            color={GREEN}
          />
        </ProductCard>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 120,
            width: 96,
            height: 96,
            marginLeft: -48,
            borderRadius: "50%",
            background: ACCENT,
            color: BLUE,
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
      <div
        style={{
          marginTop: 22,
          textAlign: "center",
          fontSize: 50,
          fontWeight: 900,
          color: HIGHLIGHT,
          opacity: qP,
          transform: `scale(${qP * (1 + Math.sin(frame / 5) * 0.04)})`,
        }}
      >
        Nên chọn gói nào?
      </div>
    </Panel>
  );
};

// ---------------------------------------------------------------- bar charts

const Bar: React.FC<{
  at: number;
  height: number;
  color: string;
  label: string;
  value: string;
  overflow: boolean;
}> = ({ at, height, color, label, value, overflow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({
    frame: frame - at,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 300,
      }}
    >
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 170,
            height: height * g,
            background: `linear-gradient(180deg, ${color}, ${color}99)`,
            borderRadius: "16px 16px 4px 4px",
            boxShadow: `0 0 30px ${color}66`,
            display: "flex",
            justifyContent: "center",
            paddingTop: 10,
            fontSize: 44,
            fontWeight: 900,
            color: "#0B1F3D",
          }}
        >
          {g > 0.6 ? value : ""}
        </div>
        {overflow && g > 0.9 ? (
          <div
            style={{
              position: "absolute",
              top: -64,
              left: 0,
              width: 170,
              textAlign: "center",
              fontSize: 56,
              color,
            }}
          >
            ▲▲
          </div>
        ) : null}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginTop: 12,
          textAlign: "center",
          opacity: g,
        }}
      >
        {label}
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

// The $1M chart shows no savings figure on purpose: the recording says "1.600",
// which doesn't match 0.4% of $1M ($4,000). Add the value once the line is re-recorded.
const LoanBars: React.FC<{ cueMs: number; variant: "100k" | "1m" }> = ({
  cueMs,
  variant,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit();
  const is100k = variant === "100k";
  const title = pop(frame, fps, 0);
  return (
    <Panel exit={exit} style={{ minHeight: 560 }}>
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: "#C9D3E6",
          opacity: title,
        }}
      >
        Khoản vay
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: HIGHLIGHT,
          lineHeight: 1,
          opacity: title,
        }}
      >
        {is100k ? "$100.000" : "$1 TRIỆU"}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 60,
          marginTop: is100k ? 30 : 90,
        }}
      >
        <Bar
          at={rel(cueMs, is100k ? 88900 : 97960)}
          height={is100k ? 150 : 300}
          color={GREEN}
          label="Tiền lãi tiết kiệm (0,4%)"
          value={is100k ? "$400" : ""}
          overflow={!is100k}
        />
        <Bar
          at={rel(cueMs, is100k ? 91560 : 106680)}
          height={150}
          color={RED}
          label="Phí năm"
          value="$400"
          overflow={false}
        />
      </div>
      {is100k ? (
        <Stamp at={rel(cueMs, 92300)} text="= HÒA VỐN" color={HIGHLIGHT} />
      ) : (
        <Stamp at={rel(cueMs, 108000)} text="✓ HỢP LÝ" color={GREEN} />
      )}
    </Panel>
  );
};

// ---------------------------------------------------------------- verdict / win-win

const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = useExit(8);
  const len = 260;
  const stroke = (a: number) =>
    len * (1 - interpolate(frame, [a, a + 12], [0, 1], clamp));
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
          stroke={RED}
          strokeWidth={14}
        />
        <path
          d="M95 95 L205 205"
          stroke={RED}
          strokeWidth={24}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={stroke(2)}
        />
        <path
          d="M205 95 L95 205"
          stroke={RED}
          strokeWidth={24}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={stroke(8)}
        />
      </svg>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          color: "#fff",
          background: RED,
          padding: "8px 30px",
          borderRadius: 14,
          marginTop: 16,
          transform: `scale(${pop(frame, fps, 6)})`,
        }}
      >
        NỢ NHỎ → KHÔNG HỢP LÝ
      </div>
    </AbsoluteFill>
  );
};

const WinWin: React.FC = () => {
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
        border: `4px solid ${ACCENT}`,
      }}
    />
  );
  // Labels sit on the outer, non-overlapping half of each circle, drawn above both.
  const label = (text: string, side: -1 | 1) => (
    <div
      style={{
        position: "absolute",
        left: left(side) + (side < 0 ? 22 : 150),
        top: 122,
        width: 128,
        textAlign: "center",
        fontSize: side < 0 ? 38 : 46,
        fontWeight: 900,
        color: "#fff",
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill style={{ top: 150, fontFamily: FONT, opacity: 1 - exit }}>
      {circle(-1, BLUE)}
      {circle(1, ACCENT)}
      {label("Broker", -1)}
      {label("Bạn", 1)}
      <div
        style={{
          position: "absolute",
          top: 320,
          width: "100%",
          textAlign: "center",
          fontSize: 66,
          fontWeight: 900,
          color: HIGHLIGHT,
          textShadow: "0 4px 0 #000, 0 0 20px rgba(0,0,0,0.8)",
          transform: `scale(${pop(frame, fps, 22)})`,
        }}
      >
        LỢI ÍCH CHUNG
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tracks

type Cue = {
  fromMs: number;
  toMs: number;
  el: (cueMs: number) => React.ReactNode;
};

const CUES: Cue[] = [
  {
    fromMs: 18600,
    toMs: 20400,
    el: () => (
      <div style={{ position: "absolute", right: 60, top: 520 }}>
        <AnimatedEmoji
          emoji="star-struck"
          scale="0.5"
          playbackRate={1.4}
          style={{ width: 240, height: 240 }}
        />
      </div>
    ),
  },
  { fromMs: 30100, toMs: 40200, el: (c) => <KineticCost cueMs={c} /> },
  { fromMs: 49200, toMs: 78550, el: (c) => <VsProducts cueMs={c} /> },
  {
    fromMs: 87600,
    toMs: 93600,
    el: (c) => <LoanBars cueMs={c} variant="100k" />,
  },
  {
    fromMs: 97100,
    toMs: 109000,
    el: (c) => <LoanBars cueMs={c} variant="1m" />,
  },
  { fromMs: 129080, toMs: 130650, el: () => <Verdict /> },
  { fromMs: 161700, toMs: 166400, el: () => <WinWin /> },
];

// WebGL light leak washing over each chapter cut (screen-blended over the video).
// Only one is mounted at a time, well inside Chrome's 16-context WebGL budget.
const LeakFlash: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <Solid
      color="#000000"
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}
      effects={[
        lightLeak({
          seed,
          hueShift: 20,
          progress: interpolate(frame, [0, durationInFrames], [0.05, 0.95]),
        }),
      ]}
    />
  );
};

// Subtle filmic finish: animated grain + vignette, pure SVG/CSS (no WebGL budget).
const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <svg
        width="1080"
        height="1920"
        style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}
      >
        <filter id="ty-do-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 12}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#ty-do-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

type Sfx = { atMs: number; file: string; volume: number };

const SFX: Sfx[] = [
  ...CHAPTERS.map((c) => ({
    atMs: c.atMs - 250,
    file: "whoosh",
    volume: 0.35,
  })),
  ...STAT_CARDS.map((c) => ({ atMs: c.atMs, file: "ding", volume: 0.22 })),
  { atMs: 34280, file: "whip", volume: 0.4 },
  { atMs: 49380, file: "mouse-click", volume: 0.5 },
  { atMs: 58800, file: "mouse-click", volume: 0.5 },
  { atMs: 92300, file: "shutter-modern", volume: 0.35 },
  { atMs: 108000, file: "ding", volume: 0.3 },
  { atMs: 129080, file: "vine-boom", volume: 0.3 },
  { atMs: 162400, file: "whoosh", volume: 0.3 },
];

export const MotionTrack: React.FC = () => (
  <>
    <FilmFinish />
    {CUES.map((c) => {
      const from = outFrame(c.fromMs);
      return (
        <Sequence
          key={c.fromMs}
          from={from}
          durationInFrames={Math.max(1, outFrame(c.toMs) - from)}
          layout="none"
        >
          {c.el(c.fromMs)}
        </Sequence>
      );
    })}
    {CHAPTERS.map((c, i) => (
      <Sequence
        key={c.atMs}
        from={Math.max(0, outFrame(c.atMs) - 12)}
        durationInFrames={26}
        layout="none"
      >
        <LeakFlash seed={i + 2} />
      </Sequence>
    ))}
    {SFX.map((s) => (
      <Sequence
        key={`${s.file}${s.atMs}`}
        from={Math.max(0, outFrame(s.atMs))}
        durationInFrames={FPS * 3}
        layout="none"
      >
        <Audio
          src={staticFile(`ty-do/sfx/${s.file}.wav`)}
          volume={() => s.volume}
        />
      </Sequence>
    ))}
  </>
);

// Hook sound: whoosh as the counter enters, a low impact as it lands.
export const HookSfx: React.FC = () => (
  <>
    <Audio src={staticFile("ty-do/sfx/whoosh.wav")} volume={0.4} />
    <Sequence from={40} layout="none">
      <Audio src={staticFile("ty-do/sfx/vine-boom.wav")} volume={0.35} />
    </Sequence>
  </>
);
