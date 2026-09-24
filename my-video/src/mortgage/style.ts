// Shared look for MortgageReel: the approved TyDoReel v7 styling on the FinHub
// brand tokens, the Be Vietnam Pro loader, springs and keyword emphasis.
import { loadFont } from "@remotion/fonts";
import { useEffect, useState } from "react";
import { spring, staticFile, useDelayRender } from "remotion";
import { brand } from "../brand/theme";
import type { Tone } from "./schema";

export const FONT = '"Be Vietnam Pro", "Segoe UI", sans-serif';
// Black "NETWORKS" wordmark: always on a white card.
export const LOGO = staticFile("brand/finhub-logo.png");
export const STROKE = "0 0 2px #000, 0 4px 0 #000, 0 0 18px rgba(0,0,0,0.85)";
export const DIM = "#C9D3E6";

export const toneColor = (t: Tone, neutral: string = brand.highlight) =>
  t === "good" ? brand.good : t === "bad" ? brand.bad : neutral;

// Workaround (labelled): under a long parallel render the OffthreadVideo frame
// server occasionally resets a connection (net::ERR_CONNECTION_RESET, seen once
// at frame 2377 of ty-do; not reproducible in isolation). The renderer retries
// that error class, but OffthreadVideo rewrites the message to "Failed to fetch
// ... disk space is low" before cancelling, so the retry never triggers (see
// docs/BUG-remotion-offthreadvideo-fetch-retry.md). Instead of cancelling, log it
// and let the frame's delayRender time out; with retries set, the renderer then
// re-renders that frame in a fresh attempt.
export const retryVideoFetch = {
  onError: (err: Error) =>
    console.warn(`OffthreadVideo fetch failed, frame will be retried: ${err.message}`),
  delayRenderRetries: 2,
  delayRenderTimeoutInMilliseconds: 30000,
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Overlay entrance (captions, stat cards, chapter banners, CTA).
export const enter = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });

// Snappier pop for infographic beats.
export const pop = (frame: number, fps: number, at: number) =>
  spring({
    frame: frame - at,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.6 },
  });

// Full TTFs (not Google's split subsets) so every Vietnamese diacritic is in one file.
export const useReelFont = () => {
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
          url: staticFile(`fonts/BeVietnamPro-${name}.ttf`),
          weight,
          display: "block",
        }),
      ),
    )
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle, continueRender, cancelRender]);
};

// Finance keywords (single tokens or phrases) highlighted in captions and on the
// cover; edit.json's `keywords` adds to these.
export const KEYWORDS = [
  "lãi suất",
  "lệ phí",
  "tiền lãi",
  "broker",
  "chi phí",
  "phí",
  "ngân hàng",
  "khoản vay",
  "vay",
  "thế chấp",
  "tiết kiệm",
  "tỷ",
  "đô",
  "hộ gia đình",
  "tín dụng",
  "tài khoản",
  "hàng tháng",
  "hàng năm",
  "tiền lời",
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:"“”()…]/g, "")
    .trim();

// Which token indices belong to a keyword phrase or contain a number.
export const emphasised = (tokens: string[], keywords: string[]): Set<number> => {
  const toks = tokens.map(norm);
  const phrases = keywords.map((k) => norm(k).split(" "));
  const hit = new Set<number>();
  toks.forEach((t, i) => {
    if (/\d/.test(t)) hit.add(i);
    for (const kw of phrases) {
      if (kw.every((w, j) => toks[i + j] === w))
        kw.forEach((_, j) => hit.add(i + j));
    }
  });
  return hit;
};
