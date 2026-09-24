// The fixed frame around every MortgageReel: cover card, hook, chrome (progress
// bar + logo), film finish, light leaks, CTA/contact card and the compliance card.
import { lightLeak } from "@remotion/effects/light-leak";
import { starburst } from "@remotion/effects/starburst";
import { Audio } from "@remotion/media";
import type React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  Solid,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BadgeRow } from "../brand/BadgeRow";
import { brand } from "../brand/theme";
import {
  CONDITIONS_NOTE_VI,
  CREDIT_REP_STATEMENT,
  DISCLAIMER_EN,
  DISCLAIMER_VI,
  LICENSING_STATEMENT,
  comparisonWarningVi,
} from "./compliance";
import { CTA_BUTTON, type EditJson } from "./schema";
import {
  FONT,
  LOGO,
  clamp,
  emphasised,
  enter,
  retryVideoFetch,
} from "./style";

// ---------------------------------------------------------------- cover

// The thumbnail card: a frozen frame of Daniel, the topic title and a subtitle
// chip. Everything has landed by frame 45, which is the thumbnail frame.
export const Cover: React.FC<{
  src: string;
  coverFrame: number;
  title: string;
  subtitle: string;
  keywords: string[];
}> = ({ src, coverFrame, title, subtitle, keywords }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = title.split(/\s+/).filter(Boolean);
  const hit = emphasised(words, keywords);
  const step = Math.min(4, 24 / Math.max(1, words.length));
  const size = Math.round(
    Math.min(128, Math.max(84, 120 * Math.sqrt(40 / title.length))),
  );
  const chip = enter(frame, fps, 6);
  const logo = enter(frame, fps, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(frame, [0, durationInFrames], [1.04, 1.12])})`,
          transformOrigin: "50% 30%",
        }}
      >
        <Freeze frame={0}>
          <OffthreadVideo
            src={src}
            trimBefore={coverFrame}
            muted
            {...retryVideoFetch}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 45%, rgba(11,31,61,0.78) 60%, rgba(11,31,61,0.97) 82%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          padding: "14px 22px",
          borderRadius: 22,
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          opacity: logo,
          transform: `translateY(${interpolate(logo, [0, 1], [-60, 0])}px)`,
        }}
      >
        <Img src={LOGO} style={{ height: 96, display: "block" }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 190,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "12px 30px",
            borderRadius: 14,
            background: brand.primary,
            color: "#fff",
            fontSize: 44,
            fontWeight: 800,
            marginBottom: 30,
            opacity: chip,
            transform: `translateX(${interpolate(chip, [0, 1], [-80, 0])}px)`,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: `0 ${Math.round(size * 0.24)}px`,
            fontSize: size,
            fontWeight: 900,
            lineHeight: 1.18,
            letterSpacing: -2,
          }}
        >
          {words.map((w, i) => {
            const p = enter(frame, fps, 4 + i * step);
            return (
              <span
                key={`${w}${i}`}
                style={{
                  display: "inline-block",
                  color: hit.has(i) ? brand.highlight : "#fff",
                  textShadow: "0 6px 24px rgba(0,0,0,0.55)",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px) scale(${interpolate(p, [0, 1], [1.25, 1])})`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
      <Audio src={staticFile("sfx/whoosh.wav")} volume={() => 0.4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- hook

export const HookTitle: React.FC<{ hook: NonNullable<EditJson["hook"]> }> = ({
  hook,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inP = enter(frame, fps);
  const outP = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const big =
    hook.countTo === undefined
      ? hook.big
      : [
          interpolate(frame, [4, 40], [0, hook.countTo], clamp).toLocaleString(
            "vi-VN",
            {
              minimumFractionDigits: hook.decimals ?? 0,
              maximumFractionDigits: hook.decimals ?? 0,
            },
          ),
          hook.suffix ?? "",
        ]
          .join(" ")
          .trim();
  const shake = frame > 40 && frame < 48 ? Math.sin(frame * 3) * 6 : 0;
  const sub = enter(frame, fps, 12);
  return (
    <AbsoluteFill style={{ opacity: outP }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(11,31,61,0.92) 0%, rgba(11,31,61,0.55) 30%, transparent 48%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            fontSize: big.length > 10 ? 150 : 190,
            fontWeight: 900,
            color: brand.highlight,
            letterSpacing: -4,
            lineHeight: 1.1,
            // RGB-split glitch while the counter shakes on landing.
            textShadow: shake
              ? `${shake * 2}px 0 0 rgba(255,40,80,0.8), ${-shake * 2}px 0 0 rgba(0,220,255,0.8)`
              : "0 10px 40px rgba(0,0,0,0.6)",
            transform: `scale(${interpolate(inP, [0, 1], [2.2, 1])}) translateX(${shake}px)`,
            opacity: inP,
          }}
        >
          {big}
        </div>
        {hook.sub ? (
          <div
            style={{
              display: "inline-block",
              marginTop: 10,
              padding: "10px 34px",
              background: "#fff",
              color: brand.primary,
              fontSize: 54,
              fontWeight: 800,
              borderRadius: 14,
              transform: `translateY(${interpolate(sub, [0, 1], [80, 0])}px)`,
              opacity: sub,
            }}
          >
            {hook.sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const MoneyRain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {new Array(34).fill(0).map((_, i) => {
        const delay = random(`d${i}`) * 30;
        if (frame < delay) return null;
        const size = 46 + random(`z${i}`) * 60;
        const isCoin = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`x${i}`) * 1080,
              top: -120 + (frame - delay) * (18 + random(`s${i}`) * 22),
              width: size,
              height: size,
              transform: `rotate(${(frame - delay) * (random(`r${i}`) * 8 - 4)}deg)`,
              borderRadius: isCoin ? "50%" : 8,
              background: isCoin
                ? `radial-gradient(circle at 35% 35%, #FFE89A, ${brand.accent} 60%, #8A6A1E)`
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
        opacity: interpolate(
          frame,
          [0, 8, durationInFrames - 12, durationInFrames],
          [0, 0.55, 0.55, 0],
          clamp,
        ),
      }}
      effects={[
        starburst({
          rays: 16,
          colors: [brand.accent, brand.background],
          rotation: frame * 1.2,
          smoothness: 0.35,
          origin: [0.5, 0.3],
        }),
      ]}
    />
  );
};

// Hook sound: whoosh as the counter enters, a low impact as it lands.
export const HookSfx: React.FC = () => (
  <>
    <Audio src={staticFile("sfx/whoosh.wav")} volume={() => 0.4} />
    <Sequence from={40} layout="none">
      <Audio src={staticFile("sfx/vine-boom.wav")} volume={() => 0.35} />
    </Sequence>
  </>
);

// ---------------------------------------------------------------- chrome

export const Chrome: React.FC<{ talkFrames: number }> = ({ talkFrames }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {/* Bottom scrim so captions read over any frame. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 10,
          width: `${Math.min(1, frame / talkFrames) * 100}%`,
          background: brand.accent,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 36,
          padding: "10px 16px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        }}
      >
        <Img src={LOGO} style={{ height: 78, display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

// Subtle filmic finish: animated grain + vignette, pure SVG/CSS (no WebGL budget).
export const FilmFinish: React.FC = () => {
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
        <filter id="reel-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 12}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#reel-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// WebGL light leak washing over a chapter cut (screen-blended over the video).
export const LeakFlash: React.FC<{ seed: number }> = ({ seed }) => {
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

// ---------------------------------------------------------------- CTA / contact

export const Outro: React.FC<{ question: string }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = enter(frame, fps, 4);
  const b = enter(frame, fps, 14);
  const c = enter(frame, fps, 26);
  const d = enter(frame, fps, 38);
  const e = enter(frame, fps, 48);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  const contact = (label: string, value: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 30,
        padding: "14px 0",
        borderTop: `2px solid ${brand.primary}22`,
      }}
    >
      <span style={{ color: "#5B6B80", fontWeight: 600 }}>{label}</span>
      <span style={{ color: brand.textOnCard, fontWeight: 800 }}>{value}</span>
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #EEF5FB 100%)",
        alignItems: "center",
        fontFamily: FONT,
        textAlign: "center",
        padding: "150px 80px 0",
      }}
    >
      <Img
        src={LOGO}
        style={{ width: 720, transform: `scale(${a})`, opacity: a }}
      />
      <div
        style={{
          marginTop: 60,
          fontSize: 62,
          fontWeight: 900,
          color: brand.textOnCard,
          lineHeight: 1.25,
          opacity: b,
          transform: `translateY(${interpolate(b, [0, 1], [40, 0])}px)`,
        }}
      >
        {question}
      </div>
      <div
        style={{
          marginTop: 46,
          padding: "26px 60px",
          borderRadius: 999,
          background: brand.primary,
          color: "#fff",
          fontSize: 54,
          fontWeight: 900,
          opacity: c,
          transform: `scale(${c * pulse})`,
          boxShadow: "0 16px 40px rgba(0,100,168,0.35)",
        }}
      >
        {CTA_BUTTON}
      </div>
      <div
        style={{
          marginTop: 50,
          width: 860,
          fontSize: 44,
          opacity: d,
          transform: `translateY(${interpolate(d, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            color: brand.primary,
            marginBottom: 10,
          }}
        >
          Daniel Nguyen
        </div>
        {contact("Điện thoại", "0430 11 11 88")}
        {contact("Email", "daniel@finhub.net.au")}
        {contact("Website", "finhub.net.au")}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 90,
          opacity: e,
          transform: `translateY(${interpolate(e, [0, 1], [60, 0])}px)`,
          boxShadow: "0 10px 30px rgba(11,31,61,0.15)",
          borderRadius: 20,
        }}
      >
        <BadgeRow height={90} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- compliance

// Mandatory disclosures under Finance Hub's own ACL, from compliance.ts. Fixed,
// static and as bold as the rest of the ad (disclosures must be as prominent as
// the advert's main content). Not editable per video beyond which notes apply.
export const ComplianceCard: React.FC<{
  compliance: EditJson["compliance"];
}> = ({ compliance }) => {
  const frame = useCurrentFrame();
  const [company, ...licence] = LICENSING_STATEMENT.split(" | ");
  const rate = compliance?.advertisedRate;
  const lines: { text: string; base: number; color?: string }[] = [
    { text: company, base: 50, color: brand.primary },
    { text: licence.join(" | "), base: 44 },
    ...(rate
      ? [
          {
            text: `Lãi suất ${rate.rateFigure} | Lãi suất so sánh ${rate.comparisonRate}`,
            base: 44,
            color: brand.primary,
          },
        ]
      : []),
    { text: CREDIT_REP_STATEMENT, base: 44 },
    { text: DISCLAIMER_EN, base: 44 },
    { text: DISCLAIMER_VI, base: 42 },
    ...(compliance?.illustrativeNumbers === false
      ? []
      : [
          {
            text: "Các con số trong video chỉ là ví dụ minh hoạ, không phải đề nghị lãi suất. Examples are illustrative only.",
            base: 38,
            color: "#33445A",
          },
        ]),
    ...(compliance?.conditionsNote
      ? [{ text: CONDITIONS_NOTE_VI, base: 38, color: "#33445A" }]
      : []),
    ...(rate
      ? [{ text: comparisonWarningVi(rate.ratesAsAt), base: 34, color: "#33445A" }]
      : []),
  ];
  // ponytail: text-fit by an area estimate (glyph ≈0.55em wide, 1.35 line
  // height, 920px column, ~1300px of height); swap for @remotion/layout-utils
  // fitText if a card ever overflows.
  const chars = lines.reduce((n, l) => n + l.text.length, 0);
  const fit = Math.sqrt(((1300 - 34 * lines.length) * 920) / (chars * 0.7425));
  const k = Math.min(1, fit / 44);
  return (
    <AbsoluteFill
      style={{
        background: "#FFFFFF",
        fontFamily: FONT,
        padding: "140px 80px 0",
        alignItems: "center",
        textAlign: "center",
        opacity: interpolate(frame, [0, 8], [0, 1], clamp),
      }}
    >
      <Img src={LOGO} style={{ width: 420 }} />
      {lines.map((l) => (
        <div
          key={l.text}
          style={{
            fontSize: Math.round(l.base * k),
            fontWeight: 800,
            color: l.color ?? brand.textOnCard,
            lineHeight: 1.35,
            marginTop: 34 * k,
          }}
        >
          {l.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};

