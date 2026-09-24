// Edit decision list for a MortgageReel video, built from the word-level
// faster-whisper transcript (words.json) and the per-video edit.json.
// Silence gaps are cut, `remove` spans drop false starts, chapters put a real
// transition on the nearest cut, and each kept segment gets a playback rate so
// Daniel's delivery lands near a steady pace. Captions and overlays are remapped
// from source time to output time through the same segment list.
//
// SELF-CONTAINED ON PURPOSE: no imports, only erasable TypeScript (types, no
// enums/namespaces/parameter properties), so scripts/export-srt.mjs can
// `import()` this file with Node's native type stripping. Keep it that way.

export type Word = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};

export type TransitionKind = "fade" | "slide" | "wipe" | "flip" | "clockWipe";

export type Pacing = {
  mode: "auto" | "off";
  target?: number; // words per second to aim for
  min?: number;
  max?: number;
  overrides?: { fromMs: number; toMs: number; rate: number }[];
};

// The parts of edit.json the timeline depends on.
export type TimelineEdit = {
  remove?: [number, number][];
  captionFixes?: { from: string; to: string }[];
  chapters?: { atMs: number; effect: TransitionKind }[];
  pacing?: Pacing;
};

export type Segment = {
  srcFrom: number; // source frame (inclusive)
  srcTo: number; // source frame (exclusive)
  outFrom: number; // output frame (talk timeline) where this segment starts
  outDuration: number; // output frames = round((srcTo - srcFrom) / rate)
  rate: number; // playbackRate
  transitionAfter: TransitionKind | null;
  zoomed: boolean;
  words: number; // spoken words in the segment
  wps: number | null; // measured words/second of its speech, null if none
};

export type OutCaption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
};

export type Timeline = {
  segments: Segment[];
  talkFrames: number;
  captions: OutCaption[];
};

// Silence longer than this (between two words) is cut out.
const MAX_GAP_MS = 380;
// Breathing room kept around speech so word onsets/tails aren't clipped.
const PAD_BEFORE_MS = 90;
const PAD_AFTER_MS = 160;
// Chapter transitions overlap both segments; they get extra silent padding so
// the overlap never plays two pieces of speech at once.
export const CHAPTER_TRANSITION_FRAMES = 10;
// The cover card plays first; the talk crossfades in over its last frames.
export const COVER_FRAMES = 75;
export const COVER_TRANSITION_FRAMES = 10;
export const TALK_START_FRAME = COVER_FRAMES - COVER_TRANSITION_FRAMES;

// Pacing defaults: Daniel's natural average is about 4.2 words/s.
const PACE_TARGET = 4.4;
const PACE_MIN = 0.9;
const PACE_MAX = 1.2;
// A segment with less speech than this gets the median rate (too little to measure).
const PACE_MIN_SPEECH_MS = 1200;
const PACE_MIN_WORDS = 5;
// Rates are snapped to 0.05 (1/20) and neighbours differ by at most 0.1.
const RATE_STEPS = 20;
const MAX_NEIGHBOUR_STEPS = 2;

// Recognition slips fixed in the captions only (audio is untouched), using the
// neighbouring words to disambiguate.
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

const bare = (s: string | undefined) =>
  s
    ?.trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "");

type EditWord = Word & { dropped: boolean };

const prepareWords = (raw: Word[], edit: TimelineEdit): EditWord[] => {
  // Whisper splits "4.1", "100.000", "0.4%" into several tokens; a token with no
  // leading space belongs to the previous word.
  const merged: Word[] = [];
  for (const w of raw) {
    const prev = merged[merged.length - 1];
    if (prev && !w.text.startsWith(" "))
      merged[merged.length - 1] = {
        ...prev,
        text: prev.text + w.text,
        endMs: w.endMs,
      };
    else merged.push(w);
  }
  const remove = edit.remove ?? [];
  const fixes = edit.captionFixes ?? [];
  return merged
    .filter((w) => w.endMs > w.startMs)
    .map((w, i, all) => {
      const prev = all[i - 1];
      // Sentence-initial "thì" (a verbal tic) after a pause or a full stop.
      const sentenceStartFiller =
        bare(w.text) === "thì" &&
        (!prev ||
          w.startMs - prev.endMs > MAX_GAP_MS ||
          /[.?!]$/.test(prev.text.trim()));
      const fixed = fixWord(
        w.text.normalize("NFC").trim(),
        bare(prev?.text),
        bare(all[i + 1]?.text),
      );
      const custom = fixes.find((f) => f.from === fixed);
      return {
        ...w,
        text: ` ${custom ? custom.to : fixed}`,
        dropped:
          sentenceStartFiller ||
          remove.some(([a, b]) => w.startMs >= a && w.endMs <= b),
      };
    });
};

type Run = {
  from: number;
  to: number;
  minFrom: number;
  maxTo: number;
  words: number;
};

// Group kept words into speech runs split by long silences or removed spans. A
// dropped word always ends the current run, and neither neighbour's padding may
// reach into it (minFrom/maxTo).
const buildRuns = (words: EditWord[]): Run[] => {
  const runs: Run[] = [];
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
    if (last && !afterDrop && w.startMs - last.to <= MAX_GAP_MS) {
      last.to = w.endMs;
      last.words++;
    } else
      runs.push({
        from: w.startMs,
        to: w.endMs,
        minFrom: afterDrop ? droppedEnd : 0,
        maxTo: Infinity,
        words: 1,
      });
    afterDrop = false;
  }
  return runs;
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Rate per run, in 1/20 steps: clamp(target / measured wps), median for runs
// too short to measure, then smoothed so neighbours differ by at most 0.1.
const paceRates = (runs: Run[], pacing: Pacing | undefined): number[] => {
  const p: Pacing = pacing ?? { mode: "auto" };
  if (p.mode === "off") return runs.map(() => 1);
  const target = p.target ?? PACE_TARGET;
  const lo = Math.ceil((p.min ?? PACE_MIN) * RATE_STEPS - 1e-9);
  const hi = Math.floor((p.max ?? PACE_MAX) * RATE_STEPS + 1e-9);
  const clampStep = (k: number) => Math.min(hi, Math.max(lo, k));
  const measurable = (r: Run) =>
    r.to - r.from >= PACE_MIN_SPEECH_MS && r.words >= PACE_MIN_WORDS;
  const raw = runs.map((r) =>
    measurable(r)
      ? clampStep(
          Math.round(
            (target / (r.words / ((r.to - r.from) / 1000))) *
              RATE_STEPS,
          ),
        )
      : null,
  );
  const known = raw.filter((k): k is number => k !== null);
  const fallback = known.length
    ? clampStep(Math.round(median(known)))
    : clampStep(RATE_STEPS);
  const steps = raw.map((k) => k ?? fallback);
  // Forward then backward pass: after the backward pass every neighbour pair is
  // within MAX_NEIGHBOUR_STEPS, because each step is clamped to its final right
  // neighbour.
  for (let i = 1; i < steps.length; i++)
    steps[i] = Math.min(
      steps[i - 1] + MAX_NEIGHBOUR_STEPS,
      Math.max(steps[i - 1] - MAX_NEIGHBOUR_STEPS, steps[i]),
    );
  for (let i = steps.length - 2; i >= 0; i--)
    steps[i] = Math.min(
      steps[i + 1] + MAX_NEIGHBOUR_STEPS,
      Math.max(steps[i + 1] - MAX_NEIGHBOUR_STEPS, steps[i]),
    );
  return steps.map((k, i) => {
    const r = runs[i];
    const o = (p.overrides ?? []).find(
      (ov) => r.from < ov.toMs && r.to > ov.fromMs,
    );
    return o ? o.rate : k / RATE_STEPS;
  });
};

// Source ms -> output ms on the talk timeline. A moment that fell in a cut snaps
// forward to the start of the next kept segment (a chapter often starts exactly
// on a cut edge); null only past the end.
export const toOutMs = (
  segments: Segment[],
  srcMs: number,
  fps: number,
): number | null => {
  const f = (srcMs * fps) / 1000;
  const seg = segments.find((s) => f < s.srcTo);
  if (!seg) return null;
  return ((seg.outFrom + Math.max(0, f - seg.srcFrom) / seg.rate) * 1000) / fps;
};

export const buildTimeline = (
  rawWords: Word[],
  edit: TimelineEdit,
  fps: number,
): Timeline => {
  const words = prepareWords(rawWords, edit);
  const runs = buildRuns(words);
  if (runs.length === 0) throw new Error("words.json has no speech to keep.");
  const msToFrame = (ms: number) => Math.round((ms * fps) / 1000);

  // Each chapter's transition lands on the cut (after run i) closest to its atMs.
  const transitionAfterRun = new Map<number, TransitionKind>();
  for (const c of edit.chapters ?? []) {
    let best = 0;
    for (let i = 1; i < runs.length - 1; i++) {
      if (
        Math.abs(runs[i + 1].from - c.atMs) <
        Math.abs(runs[best + 1].from - c.atMs)
      )
        best = i;
    }
    if (runs.length > 1) transitionAfterRun.set(best, c.effect);
  }

  const rates = paceRates(runs, edit.pacing);

  // Pad, clamp against neighbours, convert to frames, lay out on the output
  // timeline. The transition pad is in output frames, so it scales with rate.
  const transitionPadMs = ((CHAPTER_TRANSITION_FRAMES / 2 + 1) * 1000) / fps;
  const segments: Segment[] = [];
  let out = 0;
  runs.forEach((r, i) => {
    const prev = runs[i - 1];
    const next = runs[i + 1];
    const rate = rates[i];
    const padBefore =
      PAD_BEFORE_MS +
      (transitionAfterRun.has(i - 1) ? transitionPadMs * rate : 0);
    const padAfter =
      PAD_AFTER_MS + (transitionAfterRun.has(i) ? transitionPadMs * rate : 0);
    const srcFrom = msToFrame(
      Math.max(r.from - padBefore, r.minFrom, prev ? (prev.to + r.from) / 2 : 0),
    );
    const srcTo = msToFrame(
      Math.min(
        r.to + padAfter,
        r.maxTo,
        next ? (r.to + next.from) / 2 : Infinity,
      ),
    );
    const outDuration = Math.round((srcTo - srcFrom) / rate);
    const transitionAfter = transitionAfterRun.get(i) ?? null;
    const speechS = (r.to - r.from) / 1000;
    segments.push({
      srcFrom,
      srcTo,
      outFrom: out,
      outDuration,
      rate,
      transitionAfter,
      zoomed: i % 2 === 1,
      words: r.words,
      wps: speechS > 0 ? Math.round((r.words / speechS) * 100) / 100 : null,
    });
    out += outDuration - (transitionAfter ? CHAPTER_TRANSITION_FRAMES : 0);
  });
  const last = segments[segments.length - 1];
  const talkFrames = last.outFrom + last.outDuration;

  const captions: OutCaption[] = words.flatMap((w, i) => {
    // A stutter ("món món") stays in the audio but is shown once.
    if (w.dropped || w.text === words[i - 1]?.text) return [];
    const start = toOutMs(segments, w.startMs, fps);
    if (start === null) return [];
    const end =
      toOutMs(segments, w.endMs, fps) ?? start + (w.endMs - w.startMs);
    return [
      {
        text: w.text,
        startMs: start,
        endMs: Math.max(end, start + 1),
        timestampMs: start,
        confidence: w.confidence,
      },
    ];
  });

  return { segments, talkFrames, captions };
};
