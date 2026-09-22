import {evolvePath, getLength, getPointAtLength} from "@remotion/paths";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";

const ROUTE_PATH = "M 120 460 C 320 120, 560 620, 780 260 S 1080 460, 1160 220";

const STOPS = [
  {label: "Concept", fraction: 0},
  {label: "Script", fraction: 0.34},
  {label: "Storyboard", fraction: 0.68},
  {label: "Render", fraction: 1},
] as const;

const totalLength = getLength(ROUTE_PATH);

// Demonstrates: @remotion/paths driving a "draw the line" stroke animation
// (evolvePath) and a marker travelling along it (getPointAtLength) — the
// same technique the remotion-maps skill uses for animated routes.
export const RouteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  const progress = interpolate(frame, [10, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const {strokeDasharray, strokeDashoffset} = evolvePath(progress, ROUTE_PATH);
  const marker = getPointAtLength(ROUTE_PATH, progress * totalLength);

  return (
    <AbsoluteFill style={{background: gradientBg, fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 28}}>
        @remotion/paths · evolvePath + getPointAtLength
      </div>
      <svg width={1280} height={720} style={{position: "absolute", inset: 0}}>
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke={palette.accent}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
        {STOPS.map((stop) => {
          const point = getPointAtLength(ROUTE_PATH, stop.fraction * totalLength);

          if (!point) {
            return null;
          }

          const reached = progress >= stop.fraction;
          const opacity = interpolate(progress, [stop.fraction - 0.04, stop.fraction], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <g key={stop.label} opacity={reached ? opacity : 0}>
              <circle cx={point.x} cy={point.y} r={9} fill={palette.accent2} />
              <text
                x={point.x}
                y={point.y - 24}
                textAnchor="middle"
                fill={palette.text}
                fontSize={24}
                fontFamily={poppins}
              >
                {stop.label}
              </text>
            </g>
          );
        })}
        {marker ? <circle cx={marker.x} cy={marker.y} r={14} fill={palette.text} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
