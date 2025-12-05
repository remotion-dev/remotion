export interface RemotionExample {
  id: string;
  name: string;
  description: string;
  code: string;
  durationInFrames: number;
  fps: number;
  category: "Text" | "Charts" | "Shapes" | "Animation" | "3D" | "Other";
}

export const examples: RemotionExample[] = [
  {
    id: "text-rotation",
    name: "Text Rotation",
    description: "Rotating words with dissolve and blur effects",
    category: "Text",
    durationInFrames: 240,
    fps: 30,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { fps } = Remotion.useVideoConfig();

  const words = ["One sec please :)", "Getting started", "with your", "Code Generation"];
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
  );`,
  },
  {
    id: "chat-messages",
    name: "Chat Messages",
    description: "WhatsApp-style bouncy message bubbles",
    category: "Text",
    durationInFrames: 180,
    fps: 30,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { fps } = Remotion.useVideoConfig();

  const messages = [
    { text: "Hey! How are you?", isMe: false, delay: 0 },
    { text: "I'm good! Working on Remotion", isMe: true, delay: 45 },
    { text: "That's awesome! Show me!", isMe: false, delay: 90 },
    { text: "Check this out!", isMe: true, delay: 135 },
  ];

  const visibleMessages = messages.filter((msg) => frame >= msg.delay);
  const messageHeight = 100;

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 60,
        justifyContent: "flex-end",
        paddingBottom: 80,
      }}
    >
      <div style={{ width: "100%", position: "relative" }}>
        {messages.map((msg, i) => {
          const progress = Remotion.spring({
            frame: frame - msg.delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          if (frame < msg.delay) return null;

          const messagesAfter = messages.filter((m, idx) => idx > i && frame >= m.delay).length;
          const yOffset = messagesAfter * messageHeight;

          const xOffset = msg.isMe ? (1 - progress) * 100 : (1 - progress) * -100;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.isMe ? "flex-end" : "flex-start",
                marginBottom: 24,
                opacity: progress,
                transform: \`translateX(\${xOffset}px) translateY(\${-yOffset}px) scale(\${0.8 + progress * 0.2})\`,
              }}
            >
              <div
                style={{
                  backgroundColor: msg.isMe ? "#25D366" : "#2a2a2a",
                  color: "#fff",
                  padding: "20px 28px",
                  borderRadius: 24,
                  fontSize: 42,
                  fontFamily: "system-ui, sans-serif",
                  maxWidth: "70%",
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </Remotion.AbsoluteFill>
  );`,
  },
  {
    id: "counter-animation",
    name: "Counter Animation",
    description: "Animated number counters with metrics",
    category: "Charts",
    durationInFrames: 150,
    fps: 30,
    code: `
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
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: "bold",
                  color: metric.color,
                  fontFamily: "system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums",
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
  );`,
  },
  {
    id: "histogram",
    name: "Histogram",
    description: "Animated bar chart using @remotion/shapes",
    category: "Charts",
    durationInFrames: 120,
    fps: 30,
    code: `
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
  const barWidth = 80;

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

          const height = Math.max(1, (item.value / maxValue) * 300 * progress);

          return (
            <div key={i} style={{ textAlign: "center", position: "relative" }}>
              <div style={{ position: "relative", height, width: barWidth }}>
                <RemotionShapes.Rect
                  width={barWidth}
                  height={height}
                  fill={item.color}
                  cornerRadius={12}
                  style={{ filter: \`drop-shadow(0 0 8px \${item.color}50)\` }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
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
  );`,
  },
  {
    id: "progress-bar",
    name: "Progress Bar",
    description: "Animated progress bar from 0 to 100%",
    category: "Other",
    durationInFrames: 180,
    fps: 30,
    code: `
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
  );`,
  },
  {
    id: "animated-shapes",
    name: "Animated Shapes",
    description: "Bouncing and rotating SVG shapes with spring animations",
    category: "Shapes",
    durationInFrames: 180,
    fps: 30,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { fps, width, height } = Remotion.useVideoConfig();

  const shapes = [
    { type: "circle", color: "#6366f1", delay: 0 },
    { type: "triangle", color: "#10b981", delay: 15 },
    { type: "rect", color: "#f59e0b", delay: 30 },
    { type: "star", color: "#ec4899", delay: 45 },
  ];

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
          gap: 80,
          alignItems: "center",
        }}
      >
        {shapes.map((shape, i) => {
          const entrance = Remotion.spring({
            frame: frame - shape.delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });

          const rotation = Remotion.interpolate(
            frame,
            [0, 180],
            [0, 360],
            { extrapolateRight: "clamp" }
          );

          const bounce = Math.sin((frame - shape.delay) * 0.1) * 10;

          const scale = entrance;
          const opacity = entrance;

          const shapeProps = {
            fill: shape.color,
            stroke: "#fff",
            strokeWidth: 2,
          };

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: \`scale(\${scale}) translateY(\${bounce}px) rotate(\${shape.type === "star" ? rotation : 0}deg)\`,
              }}
            >
              {shape.type === "circle" && (
                <RemotionShapes.Circle radius={60} {...shapeProps} />
              )}
              {shape.type === "triangle" && (
                <RemotionShapes.Triangle length={120} direction="up" {...shapeProps} />
              )}
              {shape.type === "rect" && (
                <RemotionShapes.Rect width={100} height={100} cornerRadius={12} {...shapeProps} />
              )}
              {shape.type === "star" && (
                <RemotionShapes.Star points={5} innerRadius={40} outerRadius={70} {...shapeProps} />
              )}
            </div>
          );
        })}
      </div>
    </Remotion.AbsoluteFill>
  );`,
  },
  {
    id: "morphing-hexagons",
    name: "Morphing Hexagons",
    description:
      "Mesmerizing hexagon grid with pulsing and color-shifting effects",
    category: "Shapes",
    durationInFrames: 240,
    fps: 30,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { fps, width, height } = Remotion.useVideoConfig();

  const hexSize = 50;
  const cols = 7;
  const rows = 5;

  const hexagons = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : hexSize * 0.866;
      hexagons.push({
        x: col * hexSize * 1.732 + offsetX,
        y: row * hexSize * 1.5,
        delay: (row + col) * 3,
      });
    }
  }

  const gridWidth = (cols - 1) * hexSize * 1.732 + hexSize;
  const gridHeight = (rows - 1) * hexSize * 1.5 + hexSize * 2;

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        width={gridWidth + 100}
        height={gridHeight + 100}
        viewBox={\`-50 -50 \${gridWidth + 100} \${gridHeight + 100}\`}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {hexagons.map((hex, i) => {
          const wave = Math.sin((frame - hex.delay) * 0.08);
          const pulse = Remotion.interpolate(wave, [-1, 1], [0.6, 1]);

          const hue = Remotion.interpolate(
            (frame + hex.delay * 2) % 240,
            [0, 120, 240],
            [280, 200, 280]
          );

          const opacity = Remotion.interpolate(wave, [-1, 1], [0.3, 0.9]);

          const scale = Remotion.interpolate(wave, [-1, 1], [0.7, 1]);

          const entrance = Remotion.spring({
            frame: frame - hex.delay,
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          const points = [];
          for (let j = 0; j < 6; j++) {
            const angle = (Math.PI / 3) * j - Math.PI / 6;
            const px = hex.x + hexSize * scale * entrance * Math.cos(angle);
            const py = hex.y + hexSize * scale * entrance * Math.sin(angle);
            points.push(\`\${px},\${py}\`);
          }

          return (
            <polygon
              key={i}
              points={points.join(" ")}
              fill="none"
              stroke={\`hsl(\${hue}, 80%, 60%)\`}
              strokeWidth={2 * pulse}
              opacity={opacity * entrance}
              filter="url(#glow)"
            />
          );
        })}
      </svg>
    </Remotion.AbsoluteFill>
  );`,
  },
  {
    id: "spiral-dots",
    name: "Spiral Dots",
    description: "Hypnotic spiral of dots with rainbow colors and rotation",
    category: "Shapes",
    durationInFrames: 300,
    fps: 30,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { fps } = Remotion.useVideoConfig();

  const numDots = 120;
  const maxRadius = 280;

  const globalRotation = Remotion.interpolate(frame, [0, 300], [0, Math.PI * 4]);

  const entrance = Remotion.spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#050510",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg width={600} height={600} viewBox="-300 -300 600 600">
        <defs>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: numDots }).map((_, i) => {
          const t = i / numDots;
          const spiralAngle = t * Math.PI * 8 + globalRotation;
          const radius = t * maxRadius * entrance;

          const x = Math.cos(spiralAngle) * radius;
          const y = Math.sin(spiralAngle) * radius;

          const hue = (t * 360 + frame * 2) % 360;

          const pulse = Math.sin(frame * 0.1 + i * 0.2) * 0.5 + 1;
          const dotSize = (3 + t * 8) * pulse;

          const opacity = Remotion.interpolate(t, [0, 0.1, 1], [0, 1, 0.8]) * entrance;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={dotSize}
              fill={\`hsl(\${hue}, 90%, 60%)\`}
              opacity={opacity}
              filter="url(#dotGlow)"
            />
          );
        })}
      </svg>
    </Remotion.AbsoluteFill>
  );`,
  },
  {
    id: "lottie-animation",
    name: "Lottie Fish Loader",
    description: "Glowing fish loader animation from LottieFiles",
    category: "Animation",
    durationInFrames: 180,
    fps: 60,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { fps, durationInFrames } = Remotion.useVideoConfig();
  const [animationData, setAnimationData] = React.useState(null);

  React.useEffect(() => {
    fetch("https://assets-v2.lottiefiles.com/a/73ecc94a-4ccb-4018-a710-835b9eaffeaf/OwGeQT8PCr.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie:", err));
  }, []);

  const entrance = Remotion.spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const scale = Remotion.interpolate(entrance, [0, 1], [0.5, 1]);
  const opacity = Remotion.interpolate(entrance, [0, 1], [0, 1]);

  if (!animationData) {
    return (
      <Remotion.AbsoluteFill
        style={{
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: 24, fontFamily: "system-ui" }}>
          Loading animation...
        </div>
      </Remotion.AbsoluteFill>
    );
  }

  return (
    <Remotion.AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: \`scale(\${scale})\`,
          opacity,
        }}
      >
        <Lottie
          animationData={animationData}
          style={{ width: 400, height: 400 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          color: "#e2e8f0",
          fontSize: 24,
          fontFamily: "system-ui",
          opacity,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>Glowing Fish Loader</div>
        <div style={{ fontSize: 16, color: "#94a3b8" }}>by Mau Ali on LottieFiles</div>
      </div>
    </Remotion.AbsoluteFill>
  );`,
  },
  {
    id: "falling-spheres",
    name: "Golden Bouncing Spheres",
    description: "Glowing golden spheres with physics and orbiting camera",
    category: "3D",
    durationInFrames: 450,
    fps: 60,
    code: `
  const frame = Remotion.useCurrentFrame();
  const { width, height, fps, durationInFrames } = Remotion.useVideoConfig();

  const spheres = [
    { x: -1.5, z: -0.5, delay: 0, radius: 0.4, restitution: 0.75 },
    { x: 0, z: 0, delay: 20, radius: 0.5, restitution: 0.75 },
    { x: 1.5, z: 0.5, delay: 40, radius: 0.35, restitution: 0.75 },
    { x: -0.8, z: 1, delay: 60, radius: 0.45, restitution: 0.75 },
    { x: 0.8, z: -1, delay: 80, radius: 0.38, restitution: 0.75 },
  ];

  const gravity = 12;
  const groundY = -2;

  // Realistic bounce physics simulation
  const simulateBounce = (f, delay, radius, restitution) => {
    const elapsed = Math.max(0, f - delay);
    const t = elapsed / fps;
    const startY = 6;
    const surfaceY = groundY + radius;

    // Calculate time to first impact
    const firstImpactTime = Math.sqrt(2 * (startY - surfaceY) / gravity);

    if (t <= firstImpactTime) {
      const y = startY - 0.5 * gravity * t * t;
      return { y, squash: 1 };
    }

    // After first impact, simulate bounces
    let currentVelocity = gravity * firstImpactTime;
    let bounceStartTime = firstImpactTime;

    for (let bounce = 0; bounce < 20; bounce++) {
      currentVelocity *= restitution;

      if (currentVelocity < 0.5) {
        return { y: surfaceY, squash: 1 };
      }

      const bounceDuration = 2 * currentVelocity / gravity;
      const timeInBounce = t - bounceStartTime;

      if (timeInBounce <= bounceDuration) {
        const y = surfaceY + currentVelocity * timeInBounce - 0.5 * gravity * timeInBounce * timeInBounce;
        const impactProximity = Math.abs(y - surfaceY);
        const squash = impactProximity < 0.08 ? 0.65 + (impactProximity / 0.08) * 0.35 : 1;
        return { y: Math.max(surfaceY, y), squash };
      }

      bounceStartTime += bounceDuration;
    }

    return { y: surfaceY, squash: 1 };
  };

  return (
    <Remotion.AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 3, 8], fov: 40 }}
      >
        {/* Minimal ambient for dark scene */}
        <ambientLight intensity={0.05} />

        {/* Ground plane - dark reflective surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Bouncing golden spheres with point lights */}
        {spheres.map((sphere, i) => {
          const { y, squash } = simulateBounce(frame, sphere.delay, sphere.radius, sphere.restitution);
          const stretch = 1 / squash;

          return (
            <group key={i} position={[sphere.x, y, sphere.z]}>
              {/* Point light emanating from sphere */}
              <pointLight
                color="#ffd700"
                intensity={0.8}
                distance={4}
                decay={2}
              />
              {/* Golden sphere */}
              <mesh scale={[1, squash, stretch]}>
                <sphereGeometry args={[sphere.radius, 32, 32]} />
                <meshStandardMaterial
                  color="#ffd700"
                  emissive="#cc7a00"
                  emissiveIntensity={0.15}
                  metalness={0.4}
                  roughness={0.6}
                />
              </mesh>
            </group>
          );
        })}
      </ThreeCanvas>
    </Remotion.AbsoluteFill>
  );`,
  },
];

export function getExampleById(id: string): RemotionExample | undefined {
  return examples.find((e) => e.id === id);
}

export function getExamplesByCategory(
  category: RemotionExample["category"],
): RemotionExample[] {
  return examples.filter((e) => e.category === category);
}
