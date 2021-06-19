import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Arc: React.FC<{
  rotation: number;
  delay: number;
}> = ({ delay, rotation }) => {
  const frame = useCurrentFrame();
  const { height, width, fps } = useVideoConfig();
  const rx = 180;
  const ry = 400;
  const arcLength = Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 100,
      mass: 10,
    },
  });

  const opacity = interpolate(progress, [0, 0.2], [0, 0.7], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const strokeWidth = interpolate(progress, [0, 1], [200, 60]);

  return (
    <g
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity,
        transformOrigin: "50% 50%",
      }}
    >
      <ellipse
        cx={width / 2}
        cy={height / 2}
        x={width / 2}
        y={height / 2}
        rx={rx}
        ry={ry}
        strokeLinecap="round"
        strokeDasharray={`${arcLength}`}
        strokeDashoffset={(1 - progress) * arcLength}
        stroke="url(#lg)"
        strokeWidth={strokeWidth}
        fill="none"
      />
    </g>
  );
};
