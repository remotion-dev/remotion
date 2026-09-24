// edit.json: the ONE per-video file of editorial choices for MortgageReel.
// All times are SOURCE milliseconds (the words.json clock); the timeline remaps
// them onto the cut, paced output. Validated with zod strict objects so a typo
// ("atMS") fails the render with its path instead of silently dropping a cue.
import { z } from "zod";
import { toOutMs, type Timeline } from "./timeline";

const ms = z.number().nonnegative();
const text = z.string().min(1);
const tone = z.enum(["good", "bad", "neutral"]);
const beat = z.strictObject({ text, atMs: ms });
const span = { fromMs: ms, toMs: ms };

const kinetic = z.strictObject({
  kind: z.literal("kinetic"),
  ...span,
  kicker: text.optional(),
  struck: z.array(z.strictObject({ text, atMs: ms, strikeMs: ms })).min(1),
  slam: z.strictObject({ kicker: text.optional(), text, atMs: ms }),
  sub: beat.optional(),
});

const compareCard = z.strictObject({
  title: text,
  atMs: ms,
  highlightAtMs: ms.optional(),
  rows: z.array(
    z.strictObject({ label: text, value: text, tone, atMs: ms }),
  ),
});

const compare = z.strictObject({
  kind: z.literal("compare"),
  ...span,
  cards: z.tuple([compareCard, compareCard]),
  vsAtMs: ms.optional(),
  question: beat.optional(),
});

const bars = z.strictObject({
  kind: z.literal("bars"),
  ...span,
  kicker: text.optional(),
  title: text,
  bars: z
    .array(
      z.strictObject({
        label: text,
        value: text,
        height: z.number().min(0).max(1),
        tone,
        atMs: ms,
        // The bar breaks through the top of the chart (a value off the scale).
        overflow: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(3),
  stamp: z.strictObject({ text, tone, atMs: ms }).optional(),
});

const verdict = z.strictObject({
  kind: z.literal("verdict"),
  ...span,
  ok: z.boolean(),
  text,
});

const venn = z.strictObject({
  kind: z.literal("venn"),
  ...span,
  left: text,
  right: text,
  label: text,
});

const emoji = z.strictObject({
  kind: z.literal("emoji"),
  ...span,
  name: text, // a file in public/emoji/, without ".json"
  position: z.enum(["right", "left"]).optional(),
});

const lenders = z.strictObject({
  kind: z.literal("lenders"),
  ...span,
  title: text.optional(),
});

const cue = z
  .discriminatedUnion("kind", [
    kinetic,
    compare,
    bars,
    verdict,
    venn,
    emoji,
    lenders,
  ])
  .refine((c) => c.toMs > c.fromMs, "cue toMs must be after fromMs");

const exemption = z.strictObject({
  field: text,
  term: text,
  reason: z.enum(["definition", "quoted", "negation", "third-party-name"]),
  note: text,
});

const rate = z.number().min(0.5).max(2);

export const editSchema = z.strictObject({
  // Not shown anywhere: why a span was removed, what the video is about, etc.
  notes: z.array(z.string()).optional(),
  title: text,
  subtitle: text.optional(),
  coverFrameMs: ms.optional(),
  hook: z
    .strictObject({
      big: text,
      countTo: z.number().optional(),
      decimals: z.number().int().min(0).max(3).optional(),
      suffix: text.optional(),
      sub: text.optional(),
    })
    .optional(),
  remove: z.array(z.tuple([ms, ms])).optional(),
  captionFixes: z.array(z.strictObject({ from: text, to: text })).optional(),
  keywords: z.array(text).optional(),
  pacing: z
    .strictObject({
      mode: z.enum(["auto", "off"]),
      target: z.number().min(2).max(7).optional(),
      min: rate.optional(),
      max: rate.optional(),
      overrides: z
        .array(z.strictObject({ fromMs: ms, toMs: ms, rate }))
        .optional(),
    })
    .optional(),
  chapters: z
    .array(
      z.strictObject({
        atMs: ms,
        title: text,
        effect: z.enum(["fade", "slide", "wipe", "flip", "clockWipe"]),
      }),
    )
    .optional(),
  stats: z
    .array(z.strictObject({ atMs: ms, durMs: ms, big: text, label: text }))
    .optional(),
  cues: z.array(cue).optional(),
  cta: z.strictObject({ question: text.optional() }).optional(),
  compliance: z
    .strictObject({
      illustrativeNumbers: z.boolean().optional(),
      conditionsNote: z.boolean().optional(),
      advertisedRate: z
        .strictObject({ rateFigure: text, comparisonRate: text, ratesAsAt: text })
        .optional(),
    })
    .optional(),
  exemptions: z.array(exemption).optional(),
});

export type EditJson = z.infer<typeof editSchema>;
export type Cue = NonNullable<EditJson["cues"]>[number];
export type Tone = z.infer<typeof tone>;

export const DEFAULT_SUBTITLE = "Daniel Nguyen · Finance Hub";
export const DEFAULT_CTA_QUESTION = "Bạn cần tư vấn về khoản vay?";
export const CTA_BUTTON = "Liên hệ để được tư vấn";

// What calculateMetadata hands the component: plain JSON, so it survives being
// passed as input props to the render.
export type Reel = { edit: EditJson; timeline: Timeline };

export const parseEdit = (json: unknown, slug: string): EditJson => {
  const r = editSchema.safeParse(json);
  if (!r.success)
    throw new Error(
      `public/videos/${slug}/edit.json is invalid:\n${z.prettifyError(r.error)}`,
    );
  return r.data;
};

// Every string edit.json puts on screen, keyed by the field name an exemption
// must use ("title", "hook", "chapters", "stats", "cues[3]", "cta", ...).
export const onScreenCopy = (edit: EditJson): Record<string, string[]> => {
  const cueText = (c: Cue): string[] => {
    switch (c.kind) {
      case "kinetic":
        return [
          c.kicker ?? "",
          ...c.struck.map((s) => s.text),
          c.slam.kicker ?? "",
          c.slam.text,
          c.sub?.text ?? "",
        ];
      case "compare":
        return [
          ...c.cards.flatMap((k) => [
            k.title,
            ...k.rows.flatMap((r) => [r.label, r.value]),
          ]),
          c.question?.text ?? "",
        ];
      case "bars":
        return [
          c.kicker ?? "",
          c.title,
          ...c.bars.flatMap((b) => [b.label, b.value]),
          c.stamp?.text ?? "",
        ];
      case "verdict":
        return [c.text];
      case "venn":
        return [c.left, c.right, c.label];
      case "emoji":
        return [];
      case "lenders":
        return [c.title ?? ""];
    }
  };
  const fields: Record<string, string[]> = {
    title: [edit.title],
    subtitle: [edit.subtitle ?? DEFAULT_SUBTITLE],
    hook: edit.hook
      ? [edit.hook.big, edit.hook.suffix ?? "", edit.hook.sub ?? ""]
      : [],
    chapters: (edit.chapters ?? []).map((c) => c.title),
    stats: (edit.stats ?? []).flatMap((s) => [s.big, s.label]),
    cta: [edit.cta?.question ?? DEFAULT_CTA_QUESTION, CTA_BUTTON],
  };
  (edit.cues ?? []).forEach((c, i) => {
    fields[`cues[${i}]`] = cueText(c);
  });
  return fields;
};

// Source ms -> frame on the talk timeline (0 when past the end).
export const outFrameOf =
  (timeline: Timeline, fps: number) =>
  (srcMs: number): number =>
    Math.round(((toOutMs(timeline.segments, srcMs, fps) ?? 0) / 1000) * fps);
