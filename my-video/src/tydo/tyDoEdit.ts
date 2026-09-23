// Edit decision list for "4.1 Tỷ Đô - Con Số Người Úc Không Ngờ Tới".
// Everything is derived from the word-level faster-whisper transcript
// (words.json: {text, startMs, endMs, timestampMs, confidence}[], source-time ms):
// silence gaps are cut, REMOVE spans drop false starts/fillers, CHAPTERS put a
// real transition on the nearest cut. Captions and overlays are remapped from
// source time to output time through the same segment list, so they stay in sync.
import type { Caption } from "@remotion/captions";
import rawWords from "./words.json";

export const FPS = 30;
export const SRC = "4.1 Tỷ Đô - Con Số Người Úc Không Ngờ Tới.mp4";

export type TransitionKind = "fade" | "slide" | "wipe" | "flip" | "clockWipe";

// Silence longer than this (between two words) is cut out.
const MAX_GAP_MS = 380;
// Breathing room kept around speech so word onsets/tails aren't clipped.
const PAD_BEFORE_MS = 90;
const PAD_AFTER_MS = 160;
// Chapter transitions overlap both segments; they get extra silent padding so
// the overlap never plays two pieces of speech at once.
export const CHAPTER_TRANSITION_FRAMES = 10;

// Source-time spans (ms) to drop: false starts, repeated takes, verbal tics.
// Sentence-initial "thì" after a pause is dropped automatically (see below).
const REMOVE: [number, number][] = [
  [188480, 188960], // "Họ có," — false start before "các ngân hàng có thể…"
];

// Source-time ms where a new topic starts, with its on-screen chapter title.
export const CHAPTERS: {
  atMs: number;
  title: string;
  effect: TransitionKind;
}[] = [
  { atMs: 20560, title: "Chi phí thật sự", effect: "slide" },
  { atMs: 45480, title: "Ví dụ thực tế", effect: "wipe" },
  { atMs: 79060, title: "Tuỳ số tiền bạn vay", effect: "flip" },
  { atMs: 130780, title: "Vì sao broker quan tâm", effect: "clockWipe" },
  { atMs: 183680, title: "Ngân hàng cũng chọn khách", effect: "slide" },
  { atMs: 199340, title: "Lời khuyên", effect: "fade" },
];

// Stat cards, keyed to the source-time ms where the number is spoken. The
// product comparison and the $100K/$1M examples are full infographics in
// TyDoMotion.tsx instead.
export type StatCard = {
  atMs: number;
  durMs: number;
  big: string;
  label: string;
};
export const STAT_CARDS: StatCard[] = [
  {
    atMs: 4700,
    durMs: 3600,
    big: "$4,1 TỶ",
    label: "Phí người Úc trả ngân hàng trong 1 năm",
  },
  { atMs: 12900, durMs: 3000, big: "~$400", label: "cho mỗi hộ gia đình" },
  {
    atMs: 124600,
    durMs: 3600,
    big: "NỢ NHỎ",
    label: "Trả phí năm thường không hợp lý",
  },
  {
    atMs: 202800,
    durMs: 3800,
    big: "TỔNG CHI PHÍ",
    label: "Không chỉ nhìn lãi suất thấp nhất",
  },
];

// Recognition slips in the transcript, fixed in the captions only (audio is untouched),
// using the neighbouring words to disambiguate.
const fixWord = (
  w: string,
  prev: string | undefined,
  next: string | undefined,
): string => {
  const lw = w.toLowerCase();
  if (lw === "lợi" && next === "phí") return w.replace(/ợi/, "ệ"); // lệ phí
  if (lw === "lợi" && prev === "tiền") return w.replace(/ợi/, "ời"); // tiền lời
  if (lw === "than" && next === "chốt") return w.replace(/an/, "en"); // then chốt
  if (lw === "đắm") return w.replace(/ắm/, "óng"); // đóng
  return w;
};

type Word = Caption & { dropped: boolean };

const words: Word[] = (() => {
  // Whisper splits "4.1", "100.000", "0.4%" into several tokens; a token with no
  // leading space belongs to the previous word.
  const merged: Caption[] = [];
  for (const w of rawWords as Caption[]) {
    const prev = merged[merged.length - 1];
    if (prev && !w.text.startsWith(" "))
      merged[merged.length - 1] = {
        ...prev,
        text: prev.text + w.text,
        endMs: w.endMs,
      };
    else merged.push(w);
  }
  const bare = (s: string | undefined) =>
    s
      ?.trim()
      .toLowerCase()
      .replace(/[.,!?]/g, "");
  return merged
    .filter((w) => w.endMs > w.startMs)
    .map((w, i, all) => {
      const prev = all[i - 1];
      const sentenceStartFiller =
        bare(w.text) === "thì" &&
        (!prev ||
          w.startMs - prev.endMs > MAX_GAP_MS ||
          /[.?!]$/.test(prev.text.trim()));
      const text = fixWord(
        w.text.trim(),
        bare(prev?.text),
        bare(all[i + 1]?.text),
      );
      return {
        ...w,
        text: ` ${text}`,
        dropped:
          sentenceStartFiller ||
          REMOVE.some(([a, b]) => w.startMs >= a && w.endMs <= b),
      };
    });
})();

const msToFrame = (ms: number) => Math.round((ms * FPS) / 1000);

export type Segment = {
  srcFrom: number; // source frame (inclusive)
  srcTo: number; // source frame (exclusive)
  outFrom: number; // output frame where this segment starts
  duration: number;
  transitionAfter: TransitionKind | null;
  zoomed: boolean;
};

const buildSegments = (): Segment[] => {
  // 1. Group words into speech runs split by long silences or removed spans.
  // A dropped word always ends the current run, and neither neighbour's padding
  // may reach into it (minFrom/maxTo).
  const runs: { from: number; to: number; minFrom: number; maxTo: number }[] =
    [];
  let droppedEnd = 0;
  let afterDrop = false;
  for (const w of words) {
    const last = runs[runs.length - 1];
    if (w.dropped) {
      if (last && !afterDrop) last.maxTo = Math.min(last.maxTo, w.startMs);
      droppedEnd = w.endMs;
      afterDrop = true;
      continue;
    }
    if (last && !afterDrop && w.startMs - last.to <= MAX_GAP_MS)
      last.to = w.endMs;
    else
      runs.push({
        from: w.startMs,
        to: w.endMs,
        minFrom: afterDrop ? droppedEnd : 0,
        maxTo: Infinity,
      });
    afterDrop = false;
  }

  // 2. Each chapter's transition lands on the cut (after run i) closest to its atMs.
  const transitionAfterRun = new Map<number, TransitionKind>();
  for (const c of CHAPTERS) {
    let best = 0;
    for (let i = 1; i < runs.length - 1; i++) {
      if (
        Math.abs(runs[i + 1].from - c.atMs) <
        Math.abs(runs[best + 1].from - c.atMs)
      )
        best = i;
    }
    transitionAfterRun.set(best, c.effect);
  }

  // 3. Pad, clamp against neighbours, convert to frames, lay out on the output timeline.
  const transitionPadMs = ((CHAPTER_TRANSITION_FRAMES / 2 + 1) * 1000) / FPS;
  const segments: Segment[] = [];
  let out = 0;
  runs.forEach((r, i) => {
    const prev = runs[i - 1];
    const next = runs[i + 1];
    const padBefore =
      PAD_BEFORE_MS + (transitionAfterRun.has(i - 1) ? transitionPadMs : 0);
    const padAfter =
      PAD_AFTER_MS + (transitionAfterRun.has(i) ? transitionPadMs : 0);
    const srcFrom = msToFrame(
      Math.max(
        r.from - padBefore,
        r.minFrom,
        prev ? (prev.to + r.from) / 2 : 0,
      ),
    );
    const srcTo = msToFrame(
      Math.min(
        r.to + padAfter,
        r.maxTo,
        next ? (r.to + next.from) / 2 : Infinity,
      ),
    );
    const transitionAfter = transitionAfterRun.get(i) ?? null;
    segments.push({
      srcFrom,
      srcTo,
      outFrom: out,
      duration: srcTo - srcFrom,
      transitionAfter,
      zoomed: i % 2 === 1,
    });
    out += srcTo - srcFrom - (transitionAfter ? CHAPTER_TRANSITION_FRAMES : 0);
  });
  return segments;
};

export const SEGMENTS = buildSegments();
const lastSeg = SEGMENTS[SEGMENTS.length - 1];
export const TALK_FRAMES = lastSeg.outFrom + lastSeg.duration;

// Source ms -> output ms. A moment that fell in a cut snaps forward to the start
// of the next kept segment (a chapter often starts exactly on a cut edge); null
// only past the end.
export const toOutMs = (srcMs: number): number | null => {
  const f = (srcMs * FPS) / 1000;
  const seg = SEGMENTS.find((s) => f < s.srcTo);
  if (!seg) return null;
  return ((seg.outFrom + Math.max(0, f - seg.srcFrom)) * 1000) / FPS;
};

export const OUT_CAPTIONS: Caption[] = words.flatMap((w, i) => {
  // A stutter ("món món") stays in the audio but is shown once.
  if (w.dropped || w.text === words[i - 1]?.text) return [];
  const start = toOutMs(w.startMs);
  if (start === null) return [];
  const end = toOutMs(w.endMs) ?? start + (w.endMs - w.startMs);
  return [
    {
      ...w,
      startMs: start,
      endMs: Math.max(end, start + 1),
      timestampMs: start,
    },
  ];
});

// Finance keywords (single tokens or multi-word phrases) highlighted in captions.
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
