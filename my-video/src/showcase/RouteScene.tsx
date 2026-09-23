import {
  centerPath,
  cutPath,
  evolvePath,
  extendViewBox,
  getBoundingBox,
  getInstructionIndexAtLength,
  getLength,
  getPointAtLength,
  getSubpaths,
  getTangentAtLength,
  interpolatePath,
  normalizePath,
  parsePath,
  reduceInstructions,
  resetPath,
  reversePath,
  scalePath,
  serializeInstructions,
  translatePath,
  warpPath,
} from "@remotion/paths";
import {AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
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
const boundingBox = getBoundingBox(ROUTE_PATH);
// A faint wavy echo behind the main route, remapping every point's y
// coordinate with warpPath() — purely decorative, but a real use of the API
// rather than a manually-drawn second path.
// interpolationThreshold subdivides segments longer than 8px before warping
// (the default is derived from the path's size), so the wave stays smooth.
const warpedEcho = warpPath(ROUTE_PATH, (point) => ({...point, y: point.y + Math.sin(point.x / 45) * 14}), {
  interpolationThreshold: 8,
});
// A small "minimap" duplicate: reversed (traversed start-to-end backwards),
// reset to a 0,0 origin, then scaled down to fit a corner inset.
const minimapPath = scalePath(resetPath(reversePath(ROUTE_PATH)), 0.22, 0.22);
const minimapBox = getBoundingBox(minimapPath);
// getBoundingBox() already returns viewBox/width/height alongside x1..y2.
const minimapViewBox = extendViewBox(minimapBox.viewBox, 1.3);
// parsePath -> reduceInstructions -> serializeInstructions round-trip,
// simplifying curves to line segments; normalizePath makes every
// instruction absolute. Both just feed the info readout below.
const reducedInstructions = reduceInstructions(parsePath(ROUTE_PATH));
const reducedPath = serializeInstructions(reducedInstructions);
const normalizedPath = normalizePath(ROUTE_PATH);
const subpathCount = getSubpaths(ROUTE_PATH).length;
// A drop-shadow duplicate of the main route, offset with translatePath().
const shadowPath = translatePath(ROUTE_PATH, 6, 10);
// The route re-centered on the canvas middle with centerPath() (which
// calls translatePath() internally too) -- also the morph target for
// interpolatePath() below.
const centeredRoutePath = centerPath(ROUTE_PATH, {x: 640, y: 360});

// Demonstrates all of @remotion/paths: evolvePath() draws the line on,
// getPointAtLength() places the travelling marker and stop dots,
// getTangentAtLength() rotates the marker to face its direction of travel,
// warpPath() draws the wavy echo, and reversePath()/resetPath()/scalePath()/
// extendViewBox() build the reversed minimap in the corner. parsePath(),
// reduceInstructions(), serializeInstructions(), normalizePath() and
// getSubpaths() feed the info readout — the same technique the
// remotion-maps skill uses for animated routes. translatePath() draws a
// drop-shadow duplicate; centerPath() (which uses translatePath()
// internally too) re-centers the route on the canvas as the morph target
// for interpolatePath(); cutPath() truncates the path data itself at the
// traveled length -- a genuine alternative technique to evolvePath()'s
// stroke-dasharray trick, not just another visual layer. Also covers core
// remotion's SVG Interactive.* family (Studio-editable SVG elements) across
// all three of its distinct element factories: Interactive.Svg/G/Path (the
// generic SVG-element schema), Interactive.Line (its own stroke-only
// schema), and Interactive.Text (its own text-element schema) -- Interactive
// .Div/Span (the HTML-element schema) are used in CoreEnvironmentScene.
export const RouteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  const progress = interpolate(frame, [10, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const {strokeDasharray, strokeDashoffset} = evolvePath(progress, ROUTE_PATH);
  const currentLength = progress * totalLength;
  // cutPath() truncates the path DATA itself at a given length -- a real
  // alternative to evolvePath()'s stroke-dasharray trick above, drawn as a
  // soft highlight under the traveled portion.
  const cutRoutePath = cutPath(ROUTE_PATH, currentLength);
  // interpolatePath() morphs continuously between two path shapes; here it
  // slides the route toward its re-centered position as the scene plays.
  const morphedPath = interpolatePath(progress, ROUTE_PATH, centeredRoutePath);
  const marker = getPointAtLength(ROUTE_PATH, currentLength);
  const tangent = getTangentAtLength(ROUTE_PATH, currentLength);
  const markerAngle = tangent ? (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI : 0;
  const segmentIndex = getInstructionIndexAtLength(ROUTE_PATH, currentLength)?.index ?? 0;

  return (
    <AbsoluteFill style={{background: gradientBg, fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 28}}>
        @remotion/paths · evolvePath + getPointAtLength + getTangentAtLength
      </div>
      <Interactive.Svg name="Route canvas" width={1280} height={720} style={{position: "absolute", inset: 0}}>
        <path d={warpedEcho} fill="none" stroke={palette.accent2} strokeWidth={2} strokeDasharray="4 6" opacity={0.35} />
        <path d={morphedPath} fill="none" stroke={palette.accent2} strokeWidth={2} strokeDasharray="2 6" opacity={0.4} />
        <path d={shadowPath} fill="none" stroke="black" strokeWidth={8} strokeLinecap="round" opacity={0.25} />
        <path d={cutRoutePath} fill="none" stroke={palette.accent2} strokeWidth={12} strokeLinecap="round" opacity={0.18} />
        <rect
          x={boundingBox.x1}
          y={boundingBox.y1}
          width={boundingBox.width}
          height={boundingBox.height}
          fill="none"
          stroke={palette.textDim}
          strokeWidth={1}
          strokeDasharray="6 6"
          opacity={0.3}
        />
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
        {marker ? (
          <Interactive.G name="Direction marker" transform={`translate(${marker.x}, ${marker.y}) rotate(${markerAngle})`}>
            <Interactive.Path name="Marker arrow" d="M -14 -10 L 14 0 L -14 10 Z" fill={palette.text} />
          </Interactive.G>
        ) : null}
        <g transform={`translate(64, 560)`} opacity={0.9}>
          <Interactive.Line
            name="Readout divider"
            x1={0}
            x2={620}
            y1={-14}
            y2={-14}
            stroke={palette.textDim}
            strokeWidth={1}
            opacity={0.3}
          />
          <Interactive.Text name="Readout line 1" fill={palette.textDim} fontSize={16} fontFamily="monospace">
            getSubpaths: {subpathCount} · reduceInstructions: {reducedInstructions.length} segments ({reducedPath.length} chars) · segment #{segmentIndex}
          </Interactive.Text>
          <Interactive.Text name="Readout line 2" y={22} fill={palette.textDim} fontSize={16} fontFamily="monospace">
            normalizePath length: {normalizedPath.length} chars (vs {ROUTE_PATH.length} original)
          </Interactive.Text>
          <Interactive.Text name="Readout line 3" y={44} fill={palette.textDim} fontSize={16} fontFamily="monospace">
            cutPath: {cutRoutePath.length} chars at length {currentLength.toFixed(0)} · translatePath + centerPath + interpolatePath
          </Interactive.Text>
        </g>
        <svg x={1000} y={520} width={180} height={160} viewBox={minimapViewBox} style={{overflow: "visible"}}>
          <rect x={minimapBox.x1} y={minimapBox.y1} width={minimapBox.width} height={minimapBox.height} fill={palette.bgAlt} rx={8} />
          <path d={minimapPath} fill="none" stroke={palette.accent2} strokeWidth={2} strokeLinecap="round" />
        </svg>
        <text x={1090} y={690} textAnchor="middle" fill={palette.textDim} fontSize={14} fontFamily="monospace">
          reversePath + resetPath + scalePath
        </text>
      </Interactive.Svg>
    </AbsoluteFill>
  );
};
