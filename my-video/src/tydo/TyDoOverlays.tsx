import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { loadFont } from "@remotion/fonts";
import { Underline } from "@remotion/rough-notation";
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import {
  CHAPTERS,
  FPS,
  KEYWORDS,
  OUT_CAPTIONS,
  STAT_CARDS,
  toOutMs,
} from "./tyDoEdit";

// Finance Hub brand: logo blue, web-brand navy + amber accent.
export const BLUE = "#0064A8";
export const DARK = "#0B1F3D";
export const ACCENT = "#F5A524";
const HIGHLIGHT = "#FFB938";
export const FONT = '"Be Vietnam Pro", "Segoe UI", sans-serif';
const LOGO = staticFile("ty-do/finhub-logo.png");
const STROKE = "0 0 2px #000, 0 4px 0 #000, 0 0 18px rgba(0,0,0,0.85)";

// Full TTFs (not Google's split subsets) so every Vietnamese diacritic is in one file.
export const useTyDoFont = () => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("loading Be Vietnam Pro"));
  useEffect(() => {
    Promise.all(
      (
        [
          ["600", "SemiBold"],
          ["800", "ExtraBold"],
          ["900", "Black"],
        ] as const
      ).map(([weight, name]) =>
        loadFont({
          family: "Be Vietnam Pro",
          url: staticFile(`ty-do/BeVietnamPro-${name}.ttf`),
          weight,
          display: "block",
        }),
      ),
    )
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle, continueRender, cancelRender]);
};

const enter = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });

// ---------------------------------------------------------------- captions

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:"“”()…]/g, "")
    .trim();
const KEYWORD_TOKENS = KEYWORDS.map((k) => k.split(" "));

// Which token indices of a page belong to a keyword phrase or a number.
const emphasised = (page: TikTokPage): Set<number> => {
  const toks = page.tokens.map((t) => norm(t.text));
  const hit = new Set<number>();
  toks.forEach((t, i) => {
    if (/\d/.test(t)) hit.add(i);
    for (const kw of KEYWORD_TOKENS) {
      if (kw.every((w, j) => toks[i + j] === w))
        kw.forEach((_, j) => hit.add(i + j));
    }
  });
  return hit;
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  const hit = emphasised(page);
  const pop = enter(frame, fps);
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
          transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])}) translateY(${interpolate(pop, [0, 1], [30, 0])}px)`,
          opacity: pop,
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
                color: isKey ? HIGHLIGHT : "#fff",
                background: active && !isKey ? BLUE : "transparent",
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

export const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const { pages } = createTikTokStyleCaptions({
    captions: OUT_CAPTIONS,
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
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- hook title

export const HookTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inP = enter(frame, fps);
  const outP = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const count = interpolate(frame, [4, 40], [0, 4.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shake = frame > 40 && frame < 48 ? Math.sin(frame * 3) * 6 : 0;
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
            fontSize: 190,
            fontWeight: 900,
            color: HIGHLIGHT,
            letterSpacing: -4,
            // RGB-split glitch while the counter shakes on landing.
            textShadow: shake
              ? `${shake * 2}px 0 0 rgba(255,40,80,0.8), ${-shake * 2}px 0 0 rgba(0,220,255,0.8)`
              : "0 10px 40px rgba(0,0,0,0.6)",
            transform: `scale(${interpolate(inP, [0, 1], [2.2, 1])}) translateX(${shake}px)`,
            opacity: inP,
          }}
        >
          {count.toFixed(1).replace(".", ",")} TỶ ĐÔ
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "10px 34px",
            background: "#fff",
            color: BLUE,
            fontSize: 54,
            fontWeight: 800,
            borderRadius: 14,
            transform: `translateY(${interpolate(enter(frame, fps, 12), [0, 1], [80, 0])}px)`,
            opacity: enter(frame, fps, 12),
          }}
        >
          Con số người Úc không ngờ tới
        </div>
      </div>
    </AbsoluteFill>
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
        border: `3px solid ${ACCENT}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        fontFamily: FONT,
        textAlign: "center",
        transform: `translateY(${interpolate(inP, [0, 1], [-260, 0]) - outP * 260}px) rotate(${interpolate(inP, [0, 1], [-4, 0])}deg)`,
        opacity: 1 - outP,
      }}
    >
      <Underline
        progress={underline}
        color={HIGHLIGHT}
        strokeWidth={6}
        iterations={2}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: HIGHLIGHT,
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

export const StatCards: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {STAT_CARDS.map((c) => {
        const at = toOutMs(c.atMs);
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
          background: ACCENT,
          color: BLUE,
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
          background: BLUE,
          color: "#fff",
          fontSize: 62,
          fontWeight: 800,
          padding: "14px 44px 18px 60px",
          borderRight: `10px solid ${ACCENT}`,
        }}
      >
        {title}
      </div>
    </div>
  );
};

export const Chapters: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {CHAPTERS.map((c, i) => {
        const at = toOutMs(c.atMs);
        if (at === null) return null;
        return (
          <Sequence
            key={c.atMs}
            from={Math.round((at / 1000) * fps)}
            durationInFrames={Math.round(2.6 * FPS)}
          >
            <ChapterBanner index={i} title={c.title} />
          </Sequence>
        );
      })}
    </>
  );
};

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
          background: ACCENT,
        }}
      />
      {/* The logo's "NETWORKS" is black, so it always sits on white. */}
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

// ---------------------------------------------------------------- outro

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = enter(frame, fps, 4);
  const b = enter(frame, fps, 14);
  const c = enter(frame, fps, 26);
  const d = enter(frame, fps, 38);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  const contact = (label: string, value: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 30, padding: "14px 0", borderTop: `2px solid ${BLUE}22` }}>
      <span style={{ color: "#5B6B80", fontWeight: 600 }}>{label}</span>
      <span style={{ color: DARK, fontWeight: 800 }}>{value}</span>
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #FFFFFF 0%, #EEF5FB 100%)`,
        alignItems: "center",
        fontFamily: FONT,
        textAlign: "center",
        padding: "170px 80px 0",
      }}
    >
      <Img src={LOGO} style={{ width: 720, transform: `scale(${a})`, opacity: a }} />
      <div
        style={{
          marginTop: 70,
          fontSize: 62,
          fontWeight: 900,
          color: DARK,
          lineHeight: 1.25,
          opacity: b,
          transform: `translateY(${interpolate(b, [0, 1], [40, 0])}px)`,
        }}
      >
        Bạn đang trả bao nhiêu phí cho ngân hàng?
      </div>
      <div
        style={{
          marginTop: 50,
          padding: "26px 60px",
          borderRadius: 999,
          background: BLUE,
          color: "#fff",
          fontSize: 54,
          fontWeight: 900,
          opacity: c,
          transform: `scale(${c * pulse})`,
          boxShadow: "0 16px 40px rgba(0,100,168,0.35)",
        }}
      >
        Liên hệ để được tư vấn
      </div>
      <div
        style={{
          marginTop: 60,
          width: 860,
          fontSize: 44,
          opacity: d,
          transform: `translateY(${interpolate(d, [0, 1], [40, 0])}px)`,
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 900, color: BLUE, marginBottom: 10 }}>Daniel Nguyen</div>
        {contact("Điện thoại", "0430 11 11 88")}
        {contact("Email", "daniel@finhub.net.au")}
        {contact("Website", "finhub.net.au")}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- compliance

// Mandatory disclosures (Finance Hub's own ACL; wording from the advertising
// requirements). Held static and as bold as the rest of the ad, per the rule
// that disclosures must be as prominent as the advert's main content.
export const ComplianceCard: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const line = (text: string, size: number, color: string = DARK) => (
    <div style={{ fontSize: size, fontWeight: 800, color, lineHeight: 1.35, marginTop: 34 }}>{text}</div>
  );
  return (
    <AbsoluteFill
      style={{
        background: "#FFFFFF",
        fontFamily: FONT,
        padding: "140px 80px 0",
        alignItems: "center",
        textAlign: "center",
        opacity: fadeIn,
      }}
    >
      <Img src={LOGO} style={{ width: 420 }} />
      {line("Finance Hub & Networks Pty Ltd", 50, BLUE)}
      {line("Finance Hub & Networks Pty Ltd (Credit Representative 369168) is authorised under Australian Credit Licence 573164. ACN 644 141 613.", 44)}
      {line("Your full financial situation would need to be reviewed prior to acceptance of any offer or product.", 44)}
      {line("Tình hình tài chính của bạn cần được xem xét đầy đủ trước khi chấp nhận bất kỳ đề nghị hoặc sản phẩm nào.", 42)}
      {line("Các con số trong video chỉ là ví dụ minh hoạ, không phải đề nghị lãi suất. Examples are illustrative only.", 38, "#33445A")}
    </AbsoluteFill>
  );
};
