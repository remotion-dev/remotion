import { RemotionExample } from "./index";

export const wordCarouselCode = `import { useCurrentFrame, AbsoluteFill, interpolate } from "remotion";

export const MyAnimation = () => {
  /*
   * Prefix text with rotating words that crossfade with blur.
   */
  const frame = useCurrentFrame();

  const COLOR_TEXT = "#7b92c1";
  const PREFIX = "Created for";
  const WORDS = ["Creators", "Marketers", "Developers", "Everyone"];

  const PREFIX_FONT_SIZE = 80;
  const WORD_FONT_SIZE = 80;
  const PREFIX_WEIGHT = 300;
  const WORD_WEIGHT = 700;
  const WORD_GAP = 20;
  const HOLD_DURATION = 32;
  const FLIP_DURATION = 18;
  const BLUR_AMOUNT = 6;

  const perStep = HOLD_DURATION + FLIP_DURATION;
  const totalSteps = WORDS.length;
  const currentStep = Math.floor(frame / perStep) % totalSteps;
  const nextStep = (currentStep + 1) % totalSteps;
  const phase = frame % perStep;
  const isFlipping = phase >= HOLD_DURATION;
  const flipProgress = isFlipping ? (phase - HOLD_DURATION) / FLIP_DURATION : 0;

  const outOpacity = interpolate(flipProgress, [0, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inOpacity = interpolate(flipProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outBlur = interpolate(flipProgress, [0, 1], [0, BLUR_AMOUNT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const inBlur = interpolate(flipProgress, [0, 1], [BLUR_AMOUNT, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const longestWord = WORDS.reduce(
    (a, b) => (a.length >= b.length ? a : b),
    WORDS[0],
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: WORD_GAP,
          color: COLOR_TEXT,
        }}
      >
        <div style={{ fontSize: PREFIX_FONT_SIZE, fontWeight: PREFIX_WEIGHT }}>
          {PREFIX}
        </div>
        <div
          style={{
            position: "relative",
            fontSize: WORD_FONT_SIZE,
            fontWeight: WORD_WEIGHT,
          }}
        >
          {/* Invisible width keeper */}
          <div style={{ visibility: "hidden" }}>{longestWord}</div>
          {/* Current word (fades out during flip) */}
          {!isFlipping && (
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              {WORDS[currentStep]}
            </div>
          )}
          {/* Crossfade during flip */}
          {isFlipping && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: outOpacity,
                  filter: \`blur(\${outBlur}px)\`,
                }}
              >
                {WORDS[currentStep]}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: inOpacity,
                  filter: \`blur(\${inBlur}px)\`,
                }}
              >
                {WORDS[nextStep]}
              </div>
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const wordCarouselExample: RemotionExample = {
  id: "word-carousel",
  name: "Word Carousel",
  description: "Rotating words with crossfade and blur transitions",
  category: "Text",
  durationInFrames: 200,
  fps: 30,
  code: wordCarouselCode,
};
