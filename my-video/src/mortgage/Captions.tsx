// Talk-timeline text overlays: karaoke captions, stat cards and chapter banners.
import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { Underline } from "@remotion/rough-notation";
import type React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "../brand/theme";
import type { Reel } from "./schema";
import { toOutMs } from "./timeline";
import { FONT, STROKE, emphasised, enter } from "./style";

// ---------------------------------------------------------------- captions

const CaptionPage: React.FC<{ page: TikTokPage; keywords: string[] }> = ({
  page,
  keywords,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  const hit = emphasised(
    page.tokens.map((t) => t.text),
    keywords,
  );
  const p = enter(frame, fps);
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-start", alignItems: "center", top: 1180 }}
    >
      <div
        style={{
          width: 960,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 18px",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.15,
          textAlign: "center",
          transform: `scale(${interpolate(p, [0, 1], [0.85, 1])}) translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
          opacity: p,
        }}
      >
        {page.tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          const spoken = nowMs >= t.fromMs;
          const isKey = hit.has(i);
          return (
            <span
              key={t.fromMs}
              style={{
                display: "inline-block",
                padding: "0 10px",
                borderRadius: 16,
                color: isKey ? brand.highlight : "#fff",
                background: active && !isKey ? brand.primary : "transparent",
                opacity: spoken ? 1 : 0.55,
                textShadow: active && !isKey ? "none" : STROKE,
                transform: `scale(${active ? 1.14 : isKey ? 1.06 : 1})`,
              }}
            >
              {t.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ reel: Reel; keywords: string[] }> = ({
  reel,
  keywords,
}) => {
  const { fps } = useVideoConfig();
  const { pages } = createTikTokStyleCaptions({
    captions: reel.timeline.captions,
    combineTokensWithinMilliseconds: 900,
    breakOnSilenceAfterMilliseconds: 350,
  });
  return (
    <>
      {pages.map((page, i) => {
        const from = Math.round((page.startMs / 1000) * fps);
        const nextStart = pages[i + 1]
          ? Math.round((pages[i + 1].startMs / 1000) * fps)
          : Infinity;
        const dur = Math.min(
          Math.round(((page.durationMs + 400) / 1000) * fps),
          nextStart - from,
        );
        if (dur <= 0) return null;
        return (
          <Sequence
            key={page.startMs}
            from={from}
            durationInFrames={dur}
            layout="none"
          >
            <CaptionPage page={page} keywords={keywords} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- stat cards

const StatCardView: React.FC<{ big: string; label: string }> = ({
  big,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inP = enter(frame, fps);
  const outP = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp" },
  );
  const underline = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 90,
        right: 90,
        padding: "34px 40px 40px",
        borderRadius: 32,
        background:
          "linear-gradient(135deg, rgba(0,100,168,0.95), rgba(11,31,61,0.95))",
        border: `3px solid ${brand.accent}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        fontFamily: FONT,
        textAlign: "center",
        transform: `translateY(${interpolate(inP, [0, 1], [-260, 0]) - outP * 260}px) rotate(${interpolate(inP, [0, 1], [-4, 0])}deg)`,
        opacity: 1 - outP,
      }}
    >
      <Underline
        progress={underline}
        color={brand.highlight}
        strokeWidth={6}
        iterations={2}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: brand.highlight,
            letterSpacing: -2,
          }}
        >
          {big}
        </span>
      </Underline>
      <div
        style={{ fontSize: 44, fontWeight: 600, color: "#fff", marginTop: 14 }}
      >
        {label}
      </div>
    </div>
  );
};

export const StatCards: React.FC<{ reel: Reel }> = ({ reel }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {(reel.edit.stats ?? []).map((c) => {
        const at = toOutMs(reel.timeline.segments, c.atMs, fps);
        if (at === null) return null;
        return (
          <Sequence
            key={c.atMs}
            from={Math.round((at / 1000) * fps)}
            durationInFrames={Math.round((c.durMs / 1000) * fps)}
          >
            <StatCardView big={c.big} label={c.label} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- chapters

const ChapterBanner: React.FC<{ index: number; title: string }> = ({
  index,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inP = enter(frame, fps, 4);
  const outP = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp" },
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 140,
        left: 0,
        fontFamily: FONT,
        transform: `translateX(${interpolate(inP, [0, 1], [-1000, 0]) - outP * 1000}px)`,
      }}
    >
      <div
        style={{
          background: brand.accent,
          color: brand.primary,
          fontSize: 34,
          fontWeight: 900,
          padding: "8px 28px 8px 60px",
          width: "fit-content",
          letterSpacing: 4,
        }}
      >
        PHẦN {index + 1}
      </div>
      <div
        style={{
          background: brand.primary,
          color: "#fff",
          fontSize: 62,
          fontWeight: 800,
          padding: "14px 44px 18px 60px",
          borderRight: `10px solid ${brand.accent}`,
        }}
      >
        {title}
      </div>
    </div>
  );
};

export const Chapters: React.FC<{ reel: Reel }> = ({ reel }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {(reel.edit.chapters ?? []).map((c, i) => {
        const at = toOutMs(reel.timeline.segments, c.atMs, fps);
        if (at === null) return null;
        return (
          <Sequence
            key={c.atMs}
            from={Math.round((at / 1000) * fps)}
            durationInFrames={Math.round(2.6 * fps)}
          >
            <ChapterBanner index={i} title={c.title} />
          </Sequence>
        );
      })}
    </>
  );
};
