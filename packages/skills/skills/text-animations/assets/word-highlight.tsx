import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  spring,
} from "remotion";

export const MyAnimation = () => {
  /*
   * Highlight a word in a sentence with a spring-animated wipe effect.
   */
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COLOR_BG = "#ffffff";
  const COLOR_TEXT = "#000000";
  const COLOR_HIGHLIGHT = "#A7C7E7";

  const FULL_TEXT = "From prompt to motion graphics. This is Remotion.";
  const HIGHLIGHT_WORD = "Remotion";

  const FONT_SIZE = 72;
  const FONT_WEIGHT = 700;
  const HIGHLIGHT_START_FRAME = 30;
  const HIGHLIGHT_WIPE_DURATION = 18;

  const highlightIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
  const hasHighlight = highlightIndex >= 0;
  const preText = hasHighlight ? FULL_TEXT.slice(0, highlightIndex) : FULL_TEXT;
  const postText = hasHighlight
    ? FULL_TEXT.slice(highlightIndex + HIGHLIGHT_WORD.length)
    : "";

  const highlightProgress = spring({
    fps,
    frame: frame - HIGHLIGHT_START_FRAME,
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
        style={{
          color: COLOR_TEXT,
          fontSize: FONT_SIZE,
          fontWeight: FONT_WEIGHT,
          lineHeight: 1.15,
          whiteSpace: "pre-wrap",
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
                  transform: `translateY(-50%) scaleX(${highlightScaleX})`,
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
    </AbsoluteFill>
  );
};
