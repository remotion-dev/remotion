import { RemotionExample } from "./index";

export const staggeredListCode = `import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate, spring } from "remotion";

export const MyAnimation = () => {
  /*
   * Feature list with staggered spring entrances and subtle hover-like highlights.
   */
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COLOR_BG = "#0f0f0f";
  const COLOR_TEXT = "#ffffff";
  const COLOR_ACCENT = "#6366f1";
  const COLOR_MUTED = "#a1a1aa";

  const TITLE = "Why Choose Us";
  const FEATURES = [
    { icon: "\u26A1", title: "Lightning Fast", desc: "Built for speed from the ground up" },
    { icon: "\uD83D\uDD12", title: "Secure by Default", desc: "Enterprise-grade security included" },
    { icon: "\uD83C\uDFA8", title: "Beautiful Design", desc: "Crafted with attention to detail" },
    { icon: "\uD83D\uDE80", title: "Scale Infinitely", desc: "Grows with your business needs" },
  ];

  const TITLE_FONT_SIZE = 48;
  const ITEM_FONT_SIZE = 28;
  const DESC_FONT_SIZE = 18;
  const ICON_SIZE = 48;
  const ITEM_GAP = 24;
  const PADDING = 60;

  const TITLE_START = 0;
  const ITEMS_START = 20;
  const STAGGER_DELAY = 12;
  const SLIDE_DISTANCE = 30;

  const titleProgress = spring({
    frame: frame - TITLE_START,
    fps,
    config: { damping: 20, stiffness: 100 }
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLOR_BG,
      padding: PADDING,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif"
    }}>
      {/* Title */}
      <div style={{
        fontSize: TITLE_FONT_SIZE,
        fontWeight: 700,
        color: COLOR_TEXT,
        marginBottom: 40,
        opacity: titleProgress,
        transform: \`translateY(\${(1 - titleProgress) * 20}px)\`
      }}>
        {TITLE}
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: ITEM_GAP }}>
        {FEATURES.map((feature, i) => {
          const itemStart = ITEMS_START + i * STAGGER_DELAY;
          const itemProgress = spring({
            frame: frame - itemStart,
            fps,
            config: { damping: 15, stiffness: 120 }
          });
          const opacity = interpolate(itemProgress, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const translateX = interpolate(itemProgress, [0, 1], [SLIDE_DISTANCE, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity,
                transform: \`translateX(\${translateX}px)\`
              }}
            >
              <div style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                borderRadius: 12,
                backgroundColor: COLOR_ACCENT + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24
              }}>
                {feature.icon}
              </div>
              <div>
                <div style={{ fontSize: ITEM_FONT_SIZE, fontWeight: 600, color: COLOR_TEXT }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: DESC_FONT_SIZE, color: COLOR_MUTED, marginTop: 4 }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;

export const staggeredListExample: RemotionExample = {
  id: "staggered-list",
  name: "Staggered Feature List",
  description: "Feature list with staggered spring entrances and slide animations",
  category: "Other",
  durationInFrames: 120,
  fps: 30,
  code: staggeredListCode,
};
