import { RemotionExample } from "./index";

export const morphingHexagonsCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const hexSize = 50;
  const cols = 7;
  const rows = 5;

  const hexagons: Array<{ x: number; y: number; delay: number }> = [];
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
    <AbsoluteFill
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
          const pulse = interpolate(wave, [-1, 1], [0.6, 1]);

          const hue = interpolate(
            (frame + hex.delay * 2) % 240,
            [0, 120, 240],
            [280, 200, 280]
          );

          const opacity = interpolate(wave, [-1, 1], [0.3, 0.9]);

          const scale = interpolate(wave, [-1, 1], [0.7, 1]);

          const entrance = spring({
            frame: frame - hex.delay,
            fps,
            config: { damping: 15, stiffness: 120 },
          });

          const points: string[] = [];
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
    </AbsoluteFill>
  );
};`;

export const morphingHexagonsExample: RemotionExample = {
  id: "morphing-hexagons",
  name: "Morphing Hexagons",
  description:
    "Mesmerizing hexagon grid with pulsing and color-shifting effects",
  category: "Other",
  durationInFrames: 240,
  fps: 30,
  code: morphingHexagonsCode,
};
