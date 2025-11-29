export interface RemotionExample {
  id: string;
  name: string;
  description: string;
  code: string;
  durationInFrames: number;
  fps: number;
  category: "Text" | "Charts" | "Other";
}

export const examples: RemotionExample[] = [
  {
    id: "text-rotation",
    name: "Text Rotation",
    description: "Rotating words with dissolve and blur effects",
    category: "Text",
    durationInFrames: 240,
    fps: 30,
    code: `() => {
  const frame = Remotion.useCurrentFrame();
  const { fps } = Remotion.useVideoConfig();

  const words = ["Hello", "World", "Remotion", "React"];
  const wordDuration = 60; // frames per word
  const currentWordIndex = Math.floor(frame / wordDuration) % words.length;
  const frameInWord = frame % wordDuration;

  // Fade in/out animation
  const opacity = Remotion.interpolate(
    frameInWord,
    [0, 15, 45, 60],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  // Scale animation
  const scale = Remotion.interpolate(
    frameInWord,
    [0, 15, 45, 60],
    [0.8, 1, 1, 1.2],
    { extrapolateRight: "clamp" }
  );

  // Blur animation
  const blur = Remotion.interpolate(
    frameInWord,
    [0, 15, 45, 60],
    [10, 0, 0, 10],
    { extrapolateRight: "clamp" }
  );

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: 120,
          fontWeight: "bold",
          color: "#eee",
          opacity,
          transform: \`scale(\${scale})\`,
          filter: \`blur(\${blur}px)\`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {words[currentWordIndex]}
      </h1>
    </Remotion.AbsoluteFill>
  );
}`,
  },
  {
    id: "chat-messages",
    name: "Chat Messages",
    description: "WhatsApp-style bouncy message bubbles",
    category: "Text",
    durationInFrames: 180,
    fps: 30,
    code: `() => {
  const frame = Remotion.useCurrentFrame();
  const { fps } = Remotion.useVideoConfig();

  const messages = [
    { text: "Hey! How are you?", isMe: false, delay: 0 },
    { text: "I'm good! Working on Remotion", isMe: true, delay: 30 },
    { text: "That's awesome! Show me!", isMe: false, delay: 60 },
    { text: "Check this out!", isMe: true, delay: 90 },
  ];

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 40,
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        {messages.map((msg, i) => {
          const progress = Remotion.spring({
            frame: frame - msg.delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          if (frame < msg.delay) return null;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
                opacity: progress,
                transform: \`translateY(\${(1 - progress) * 30}px) scale(\${0.8 + progress * 0.2})\`,
              }}
            >
              <div
                style={{
                  backgroundColor: msg.isMe ? "#25D366" : "#2a2a2a",
                  color: "#fff",
                  padding: "12px 18px",
                  borderRadius: 18,
                  fontSize: 24,
                  fontFamily: "system-ui, sans-serif",
                  maxWidth: 300,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </Remotion.AbsoluteFill>
  );
}`,
  },
  {
    id: "counter-animation",
    name: "Counter Animation",
    description: "Animated number counters with metrics",
    category: "Charts",
    durationInFrames: 150,
    fps: 30,
    code: `() => {
  const frame = Remotion.useCurrentFrame();
  const { fps, durationInFrames } = Remotion.useVideoConfig();

  const metrics = [
    { label: "Users", target: 10000, color: "#4f46e5" },
    { label: "Revenue", target: 50000, prefix: "$", color: "#10b981" },
    { label: "Growth", target: 127, suffix: "%", color: "#f59e0b" },
  ];

  const progress = Remotion.interpolate(
    frame,
    [0, durationInFrames * 0.7],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#0f0f0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 60,
        }}
      >
        {metrics.map((metric, i) => {
          const staggeredProgress = Remotion.interpolate(
            progress,
            [i * 0.15, i * 0.15 + 0.7],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const value = Math.round(metric.target * staggeredProgress);

          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                opacity: Remotion.interpolate(staggeredProgress, [0, 0.2], [0, 1]),
                transform: \`translateY(\${(1 - staggeredProgress) * 20}px)\`,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: "bold",
                  color: metric.color,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {metric.prefix || ""}{value.toLocaleString()}{metric.suffix || ""}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: "#888",
                  marginTop: 8,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>
    </Remotion.AbsoluteFill>
  );
}`,
  },
  {
    id: "histogram",
    name: "Histogram",
    description: "Animated bar chart with data visualization",
    category: "Charts",
    durationInFrames: 120,
    fps: 30,
    code: `() => {
  const frame = Remotion.useCurrentFrame();
  const { fps } = Remotion.useVideoConfig();

  const data = [
    { label: "Mon", value: 65, color: "#6366f1" },
    { label: "Tue", value: 85, color: "#8b5cf6" },
    { label: "Wed", value: 45, color: "#a855f7" },
    { label: "Thu", value: 95, color: "#d946ef" },
    { label: "Fri", value: 75, color: "#ec4899" },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "flex-end",
        padding: 60,
        paddingBottom: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 24,
          height: 400,
          width: "100%",
          justifyContent: "center",
        }}
      >
        {data.map((item, i) => {
          const delay = i * 10;
          const progress = Remotion.spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 100 },
          });

          const height = (item.value / maxValue) * 300 * progress;

          return (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height,
                  backgroundColor: item.color,
                  borderRadius: "8px 8px 0 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  paddingTop: 10,
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                    opacity: progress,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {Math.round(item.value * progress)}
                </span>
              </div>
              <div
                style={{
                  color: "#888",
                  fontSize: 16,
                  marginTop: 12,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </Remotion.AbsoluteFill>
  );
}`,
  },
  {
    id: "progress-bar",
    name: "Progress Bar",
    description: "Animated progress bar from 0 to 100%",
    category: "Other",
    durationInFrames: 180,
    fps: 30,
    code: `() => {
  const frame = Remotion.useCurrentFrame();
  const { durationInFrames } = Remotion.useVideoConfig();

  const progress = Remotion.interpolate(
    frame,
    [0, durationInFrames * 0.8],
    [0, 100],
    { extrapolateRight: "clamp" }
  );

  const opacity = Remotion.interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ width: 600 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 24,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Loading...
          </span>
          <span
            style={{
              color: "#10b981",
              fontSize: 24,
              fontWeight: "bold",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 24,
            backgroundColor: "#333",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: \`\${progress}%\`,
              height: "100%",
              background: "linear-gradient(90deg, #10b981, #34d399)",
              borderRadius: 12,
              transition: "width 0.1s ease-out",
            }}
          />
        </div>
      </div>
    </Remotion.AbsoluteFill>
  );
}`,
  },
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"]
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
