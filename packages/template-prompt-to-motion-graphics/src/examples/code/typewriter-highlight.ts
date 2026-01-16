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
   * Typewriter with blinking cursor, dramatic pause, spring-based highlight, and layer crossfade.
   */
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COLOR_BG = "#ffffff";
  const COLOR_TEXT = "#000000";
  const COLOR_HIGHLIGHT = "#A7C7E7";

  const FULL_TEXT = "From prompt to motion graphics. This is Remotion.";
  const HIGHLIGHT_WORD = "Remotion";
  const CARET_SYMBOL = "\u258C";
  const SPLIT_AFTER = " This is Remotion.";

  const FONT_SIZE = 72;
  const FONT_WEIGHT = 700;
  const CHAR_FRAMES = 2;
  const CURSOR_BLINK_FRAMES = 16;
  const HIGHLIGHT_DELAY = 6;
  const HIGHLIGHT_WIPE_DURATION = 18;
  const CROSSFADE_DURATION = 8;
  const WAIT_AFTER_PRE_SECONDS = 1;

  const WAIT_AFTER_PRE_FRAMES = Math.round(fps * WAIT_AFTER_PRE_SECONDS);
  const f = frame;

  const splitIndex = FULL_TEXT.indexOf(SPLIT_AFTER);
  const preLen = splitIndex >= 0 ? splitIndex : FULL_TEXT.length;
  const postLen = FULL_TEXT.length - preLen;

  let typedChars = 0;
  if (f < preLen * CHAR_FRAMES) {
    typedChars = Math.floor(f / CHAR_FRAMES);
  } else if (f < preLen * CHAR_FRAMES + WAIT_AFTER_PRE_FRAMES) {
    typedChars = preLen;
  } else {
    const postPhase = f - preLen * CHAR_FRAMES - WAIT_AFTER_PRE_FRAMES;
    typedChars = Math.min(
      FULL_TEXT.length,
      preLen + Math.floor(postPhase / CHAR_FRAMES),
    );
  }
  const typedText = FULL_TEXT.slice(0, typedChars);
  const typingDone = typedChars >= FULL_TEXT.length;

  const caretOpacity = !typingDone
    ? interpolate(
        f % CURSOR_BLINK_FRAMES,
        [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
        [1, 0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const highlightIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
  const hasHighlight = highlightIndex >= 0;
  const preText = hasHighlight ? FULL_TEXT.slice(0, highlightIndex) : FULL_TEXT;
  const postText = hasHighlight
    ? FULL_TEXT.slice(highlightIndex + HIGHLIGHT_WORD.length)
    : "";

  const typeEnd =
    preLen * CHAR_FRAMES + WAIT_AFTER_PRE_FRAMES + postLen * CHAR_FRAMES;
  const highlightStart = typeEnd + HIGHLIGHT_DELAY;

  const typedOpacity = interpolate(
    f,
    [highlightStart - CROSSFADE_DURATION, highlightStart + CROSSFADE_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const finalOpacity = interpolate(
    f,
    [highlightStart, highlightStart + CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const entrance = spring({
    fps,
    frame: f,
    config: { damping: 200, stiffness: 120 },
    durationInFrames: 20,
  });
  const containerScale = interpolate(entrance, [0, 1], [0.98, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightProgress = spring({
    fps,
    frame: f - highlightStart,
    config: { damping: 200, stiffness: 180 },
    durationInFrames: HIGHLIGHT_WIPE_DURATION,
  });
  const highlightScaleX = Math.max(0, Math.min(1, highlightProgress));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{ position: "relative", transform: \`scale(\${containerScale})\` }}
      >
        {/* Typing layer */}
        <div
          style={{
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: 1.15,
            whiteSpace: "pre-wrap",
            opacity: typedOpacity,
          }}
        >
          <span>{typedText}</span>
          <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
        </div>
        {/* Final layer with highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            color: COLOR_TEXT,
            fontSize: FONT_SIZE,
            fontWeight: FONT_WEIGHT,
            lineHeight: 1.15,
            whiteSpace: "pre-wrap",
            opacity: finalOpacity,
          }}
        >
          {hasHighlight ? (
            <>
              <span>{preText}</span>
              <span style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "50%",
                    height: "1.05em",
                    transform: \`translateY(-50%) scaleX(\${highlightScaleX})\`,
                    transformOrigin: "left center",
                    backgroundColor: COLOR_HIGHLIGHT,
                    borderRadius: "0.18em",
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
  description: "Typewriter effect with blinking cursor, pause, and spring-animated word highlight",
  category: "Text",
  durationInFrames: 180,
  fps: 30,
  code: typewriterHighlightCode,
};
