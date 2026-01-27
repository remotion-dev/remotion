import { RemotionExample } from "./index";

export const typewriterHighlightCode = `import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

export const MyAnimation = () => {
  /*
   * Centered "Hello world" appears with a typewriter reveal and a smoothly blinking caret.
   * After the full phrase is typed, the word "world" crossfades into a yellow-highlighted final state.
   */
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const COLOR_BG = "#FFFFFF";
  const COLOR_TEXT = "#000000";
  const COLOR_HIGHLIGHT = "#FFE44D";

  const FULL_TEXT = "Hello world";
  const HIGHLIGHT_WORD = "world";
  const CARET_SYMBOL = "▌";

  const FONT_SIZE = Math.max(54, Math.round(width * 0.07));
  const FONT_WEIGHT = 800;
  const LINE_HEIGHT = 1.05;

  const CHAR_FRAMES = 3;
  const CURSOR_BLINK_FRAMES = 16;

  const HIGHLIGHT_DELAY = 10;
  const HIGHLIGHT_WIPE_DURATION = 18;
  const CROSSFADE_DURATION = 10;

  const entranceProgress = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 140, mass: 0.9 },
    durationInFrames: 26,
  });

  const containerTranslateX = interpolate(entranceProgress, [0, 1], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const containerOpacity = interpolate(entranceProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const typedChars = Math.min(
    FULL_TEXT.length,
    Math.floor(frame / CHAR_FRAMES),
  );
  const typedText = FULL_TEXT.slice(0, typedChars);
  const typingDone = typedChars >= FULL_TEXT.length;

  const caretOpacity = !typingDone
    ? interpolate(
        frame % CURSOR_BLINK_FRAMES,
        [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
        [1, 0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const typeEndFrame = FULL_TEXT.length * CHAR_FRAMES;
  const highlightStart = typeEndFrame + HIGHLIGHT_DELAY;

  const typedLayerOpacity = 1;
  const finalLayerOpacity = interpolate(
    frame,
    [highlightStart, highlightStart + CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const highlightWordIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
  const hasHighlight = highlightWordIndex >= 0;

  const preText = hasHighlight ? FULL_TEXT.slice(0, highlightWordIndex) : "";
  const postText = hasHighlight
    ? FULL_TEXT.slice(highlightWordIndex + HIGHLIGHT_WORD.length)
    : "";

  const highlightProgress = spring({
    fps,
    frame: frame - highlightStart,
    config: { damping: 22, stiffness: 180, mass: 0.9 },
    durationInFrames: HIGHLIGHT_WIPE_DURATION,
  });

  const highlightScaleX = interpolate(highlightProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        fontFamily: "Inter, sans-serif",
        padding: Math.max(44, Math.round(width * 0.06)),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          opacity: containerOpacity,
          transform: \`translateX(\${containerTranslateX}px)\`,
        }}
      >
        {/* Typewriter layer */}
        <div
          style={{
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: LINE_HEIGHT,
            letterSpacing: -0.5,
            whiteSpace: "pre",
            opacity: typedLayerOpacity,
          }}
        >
          <span>{typedText}</span>
          <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
        </div>

        {/* Final highlighted layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: LINE_HEIGHT,
            letterSpacing: -0.5,
            whiteSpace: "pre",
            opacity: finalLayerOpacity,
          }}
        >
          {hasHighlight ? (
            <>
              <span>{preText}</span>
              <span style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-0.12em",
                    right: "-0.12em",
                    top: "50%",
                    height: "1.05em",
                    transform: \`translateY(-50%) scaleX(\${highlightScaleX})\`,
                    transformOrigin: "left center",
                    backgroundColor: COLOR_HIGHLIGHT,
                    borderRadius: "0.2em",
                    zIndex: 0,
                  }}
                />
                <span style={{ position: "relative", zIndex: 1 }}>
                  {HIGHLIGHT_WORD}
                </span>
              </span>
              <span>{postText}</span>
            </>
          ) : (
            <span>{FULL_TEXT}</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const typewriterHighlightExample: RemotionExample = {
  id: "typewriter-highlight",
  name: "Typewriter with Highlight",
  description: "Typewriter effect with blinking cursor and spring-animated word highlight",
  category: "Text",
  durationInFrames: 90,
  fps: 30,
  code: typewriterHighlightCode,
};
