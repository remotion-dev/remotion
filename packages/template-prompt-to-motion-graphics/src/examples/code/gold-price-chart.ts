import { RemotionExample } from "./index";

export const goldPriceChartCode = `import { useCurrentFrame, useVideoConfig, AbsoluteFill, spring } from "remotion";

export const MyAnimation = () => {
  /*
   * Elegant animated bar chart showing gold prices with Y-axis, staggered spring animations, and full-width layout.
   */
  const frame = useCurrentFrame();
  const { fps, height: videoHeight } = useVideoConfig();

  const TITLE = "Gold Price 2024";
  const UNIT = "USD per troy ounce";
  const COLOR_BAR = "#D4AF37";
  const COLOR_TEXT = "#ffffff";
  const COLOR_MUTED = "#888888";
  const COLOR_BG = "#0a0a0a";
  const COLOR_AXIS = "#333333";

  const PADDING = 50;
  const HEADER_HEIGHT = 70;
  const LABEL_HEIGHT = 32;
  const BAR_GAP = 8;
  const BAR_RADIUS = 4;
  const TITLE_FONT_SIZE = 24;
  const LABEL_FONT_SIZE = 11;
  const VALUE_FONT_SIZE = 11;
  const AXIS_FONT_SIZE = 12;
  const STAGGER_DELAY = 5;
  const HEADER_START_FRAME = 0;
  const BARS_START_FRAME = 10;
  const SPRING_DAMPING = 18;
  const SPRING_STIFFNESS = 80;

  const data = [
    { month: "Jan", price: 2039 },
    { month: "Feb", price: 2024 },
    { month: "Mar", price: 2160 },
    { month: "Apr", price: 2330 },
    { month: "May", price: 2327 },
    { month: "Jun", price: 2339 },
    { month: "Jul", price: 2426 },
    { month: "Aug", price: 2503 },
    { month: "Sep", price: 2634 },
    { month: "Oct", price: 2735 },
    { month: "Nov", price: 2672 },
    { month: "Dec", price: 2650 },
  ];

  const minPrice = 1900;
  const maxPrice = 2800;
  const priceRange = maxPrice - minPrice;
  const chartHeight = videoHeight - (PADDING * 2) - HEADER_HEIGHT - LABEL_HEIGHT;
  const yAxisSteps = [1900, 2100, 2300, 2500, 2700];

  const headerOpacity = spring({
    frame: frame - HEADER_START_FRAME,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        padding: PADDING,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ height: HEADER_HEIGHT, opacity: headerOpacity, marginBottom: 10 }}>
        <div style={{ color: COLOR_TEXT, fontSize: TITLE_FONT_SIZE, fontWeight: 600 }}>{TITLE}</div>
        <div style={{ color: COLOR_MUTED, fontSize: 14, marginTop: 4 }}>{UNIT}</div>
      </div>

      {/* Chart container */}
      <div style={{ display: "flex", alignItems: "flex-end", width: "100%", flex: 1 }}>
        {/* Y-Axis */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: chartHeight,
            paddingRight: 12,
            marginBottom: LABEL_HEIGHT,
          }}
        >
          {yAxisSteps.slice().reverse().map((step) => (
            <div
              key={step}
              style={{
                color: COLOR_MUTED,
                fontSize: AXIS_FONT_SIZE,
                textAlign: "right",
                minWidth: 40,
              }}
            >
              {step.toLocaleString()}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: BAR_GAP,
            height: chartHeight,
            flex: 1,
            borderLeft: \`1px solid \${COLOR_AXIS}\`,
            borderBottom: \`1px solid \${COLOR_AXIS}\`,
            paddingLeft: 8,
          }}
        >
          {data.map((item, i) => {
            const delay = i * STAGGER_DELAY;
            const progress = spring({
              frame: frame - delay - BARS_START_FRAME,
              fps,
              config: { damping: SPRING_DAMPING, stiffness: SPRING_STIFFNESS },
            });

            const normalizedHeight = ((item.price - minPrice) / priceRange) * chartHeight;
            const height = normalizedHeight * progress;

            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height,
                    backgroundColor: COLOR_BAR,
                    borderRadius: \`\${BAR_RADIUS}px \${BAR_RADIUS}px 0 0\`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: 6,
                    minHeight: height > 0 ? 4 : 0,
                  }}
                >
                  {height > 30 && (
                    <span
                      style={{
                        color: COLOR_BG,
                        fontSize: VALUE_FONT_SIZE,
                        fontWeight: 600,
                        opacity: progress,
                      }}
                    >
                      {item.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: COLOR_MUTED,
                    fontSize: LABEL_FONT_SIZE,
                    marginTop: 8,
                    height: LABEL_HEIGHT - 8,
                  }}
                >
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};`;

export const goldPriceChartExample: RemotionExample = {
  id: "gold-price-chart",
  name: "Gold Price Chart",
  description: "Animated bar chart with Y-axis labels and staggered spring animations",
  category: "Charts",
  durationInFrames: 150,
  fps: 30,
  code: goldPriceChartCode,
};
