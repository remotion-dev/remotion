import { Easing, Interactive, Sequence, interpolate, useCurrentFrame, type InteractiveBaseProps, type InteractiveTransformProps, type InteractivitySchema, type SequenceControls } from "remotion";
import { forwardRef, useImperativeHandle, useRef, type ComponentProps } from "react";

interface WordStreamProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  wordGap?: number;
  hold?: number;
  drift?: number;
  speed?: number;
  className?: string;
}

interface PhraseSchedule {
  words: string[];
  start: number;
  exitStart: number;
  last: boolean;
}

const REVEAL_FRAMES = 3;
const ENTRY_FRAMES = 8;
const RUN_OUT_FRAMES = 5;
const SWAP_OVERLAP = 0;

function wordStreamLength(text: string, wordGap = 6, hold = 18): number {
  const schedule = schedulePhrases(text, wordGap, hold);
  const finalPhrase = schedule[schedule.length - 1];
  if (!finalPhrase) return 0;
  return (
    finalPhrase.start + (finalPhrase.words.length - 1) * wordGap + REVEAL_FRAMES
  );
}

function schedulePhrases(
  text: string,
  wordGap: number,
  hold: number,
): PhraseSchedule[] {
  const phrases = text
    .split("|")
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  let cursor = 0;
  return phrases.map((phrase, i) => {
    const words = phrase.split(/\s+/);
    const start = cursor;
    const complete = start + (words.length - 1) * wordGap + REVEAL_FRAMES;
    const exitStart = complete + hold;
    cursor = exitStart + SWAP_OVERLAP;
    return { words, start, exitStart, last: i === phrases.length - 1 };
  });
}

const revealEasing = Easing.bezier(0.2, 0.8, 0.2, 1);
const entryEasing = Easing.bezier(0.2, 0.8, 0.3, 1);
const runOutEasing = Easing.bezier(0.7, 0, 0.9, 0.4);

function WordStreamBase({
  text,
  fontSize = 72,
  color = "#171717",
  fontWeight = 400,
  wordGap = 6,
  hold = 18,
  drift = 2,
  speed = 1,
  className,
}: WordStreamProps) {
  const frame = useCurrentFrame() * speed;

  const schedule = schedulePhrases(text, wordGap, hold);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "transparent",
      }}
    >
      {schedule.map((phrase, i) => {
        if (frame < phrase.start) return null;
        if (!phrase.last && frame >= phrase.exitStart) return null;

        const scale = fontSize / 72;
        const crawl = scale * drift;
        const life = phrase.exitStart - phrase.start;

        const entryX = interpolate(
          frame,
          [phrase.start, phrase.start + ENTRY_FRAMES],
          [scale * 30, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: entryEasing,
          },
        );
        const crawlX =
          crawl *
          (life / 2 - (Math.min(frame, phrase.exitStart) - phrase.start));
        const runOutX = phrase.last
          ? 0
          : interpolate(
              frame,
              [phrase.exitStart - RUN_OUT_FRAMES, phrase.exitStart],
              [0, -scale * 80],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: runOutEasing,
              },
            );
        const x = entryX + crawlX + runOutX;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              translate: `${x}px 0`,
            }}
          >
            <span
              className={className}
              style={{
                fontSize,
                fontWeight,
                color,
                letterSpacing: "-0.02em",
                fontFamily:
                  "var(--font-geist-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
              }}
            >
              {phrase.words.map((word, j) => {
                const revealAt = phrase.start + j * wordGap;

                const opacity = interpolate(
                  frame,
                  [revealAt, revealAt + REVEAL_FRAMES],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: revealEasing,
                  },
                );

                return (
                  <span
                    key={j}
                    style={{
                      display: "inline-block",
                      whiteSpace: "pre",
                      marginRight:
                        j < phrase.words.length - 1 ? "0.28em" : undefined,
                      opacity,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const elementSchema = {
  ...Interactive.baseSchema,
  text: {
    type: "text-content",
    default: "introducing | one-tap checkout | for your store",
    description: "Phrases (| separated)",
  },
  fontSize: {
    type: "number",
    min: 12,
    max: 160,
    step: 1,
    default: 72,
    description: "Font size",
    hiddenFromList: false,
  },
  wordGap: {
    type: "number",
    min: 2,
    max: 30,
    step: 1,
    default: 6,
    description: "Frames / word",
    hiddenFromList: false,
  },
  hold: {
    type: "number",
    min: 6,
    max: 90,
    step: 3,
    default: 18,
    description: "Phrase hold",
    hiddenFromList: false,
  },
  drift: {
    type: "number",
    min: 0,
    max: 6,
    step: 0.5,
    default: 2,
    description: "Drift px / frame",
    hiddenFromList: false,
  },
  color: {
    type: "color",
    default: "#171717",
    description: "Color",
  },
  fontWeight: {
    type: "enum",
    default: "400",
    variants: {
      "400": {},
      "500": {},
      "600": {},
      "700": {},
    },
    description: "Font weight",
  },
  speed: {
    type: "number",
    default: 1,
    min: 0.25,
    max: 4,
    step: 0.25,
    description: "Speed",
    hiddenFromList: false,
  },
  width: {
    type: "number",
    default: 700,
    min: 10,
    step: 10,
    description: "Width",
  },
  height: {
    type: "number",
    default: 110,
    min: 10,
    step: 10,
    description: "Height",
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const ELEMENT_PROP_KEYS = new Set(["text","fontSize","wordGap","hold","drift","color","fontWeight","speed"]);

const ELEMENT_PROP_DEFAULTS: Record<string, unknown> = {
  text: "introducing | one-tap checkout | for your store",
  fontSize: 72,
  wordGap: 6,
  hold: 18,
  drift: 2,
  color: "#171717",
  fontWeight: "400",
  speed: 1,
};

type WordStreamElementProps = InteractiveBaseProps &
  InteractiveTransformProps & { readonly width?: number; readonly height?: number } &
  ComponentProps<typeof WordStreamBase>;

const WordStreamInner = forwardRef<
  HTMLDivElement,
  WordStreamElementProps & { readonly controls: SequenceControls | undefined }
>(({ controls, name, style, width = 700, height = 110, ...rest }, ref) => {
  const outlineRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);
  const componentProps: Record<string, unknown> = { ...ELEMENT_PROP_DEFAULTS };
  const sequenceProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (ELEMENT_PROP_KEYS.has(key)) {
      if (value !== undefined) componentProps[key] = value;
    } else {
      sequenceProps[key] = value;
    }
  }
  return (
    <Sequence
      layout="none"
      {...sequenceProps}
      controls={controls}
      name={name ?? "<WordStream>"}
      outlineRef={outlineRef}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={outlineRef}
          style={{
            position: "relative",
            width,
            height,
            ...style,
          }}
        >
          <WordStreamBase
            {...(componentProps as unknown as ComponentProps<typeof WordStreamBase>)}
          />
        </div>
      </div>
    </Sequence>
  );
});

export const WordStream = Interactive.withSchema({
  Component: WordStreamInner,
  componentName: "<WordStream>",
  componentIdentity: null,
  schema: elementSchema,
  supportsEffects: false,
});
