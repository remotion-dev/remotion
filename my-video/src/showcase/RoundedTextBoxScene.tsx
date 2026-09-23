import {fitTextOnNLines, measureText} from "@remotion/layout-utils";
import {createRoundedTextBox} from "@remotion/rounded-text-box";
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const TEXT = "ROUNDED TEXT BOX";
const OUTER_MAX_WIDTH = 700;
const HORIZONTAL_PADDING = 40;
const BORDER_RADIUS = 28;
const LINE_HEIGHT = 1.2;

// Demonstrates: @remotion/layout-utils' fitTextOnNLines()/measureText() +
// @remotion/rounded-text-box's createRoundedTextBox() -- the TikTok/
// Instagram-style rounded caption background, sized from real text
// measurements rather than a fixed box. fitTextOnNLines() finds the font
// size that fits TEXT on one line; measureText() re-measures the resulting
// line at that size; createRoundedTextBox() turns those measurements into
// an SVG path (via @remotion/paths' bounding-box shape) sized exactly to
// the text. Both measuring functions only work in the browser, which is
// exactly where a Remotion render already runs.
export const RoundedTextBoxScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();

  const {fontSize, lines} = fitTextOnNLines({
    text: TEXT,
    maxBoxWidth: OUTER_MAX_WIDTH - HORIZONTAL_PADDING * 2,
    maxLines: 1,
    fontFamily: poppins,
    fontWeight: "700",
    maxFontSize: 64,
  });

  const textMeasurements = lines.map((line) =>
    measureText({
      text: line,
      fontFamily: poppins,
      fontSize,
      fontWeight: "700",
      additionalStyles: {lineHeight: LINE_HEIGHT},
    }),
  );

  const {d, boundingBox} = createRoundedTextBox({
    textMeasurements,
    textAlign: "center",
    horizontalPadding: HORIZONTAL_PADDING,
    borderRadius: BORDER_RADIUS,
  });

  const scale = spring({frame, fps, config: {damping: 12}});

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/rounded-text-box · sized from real text measurements
      </div>
      <div style={{transform: `scale(${scale})`, width: boundingBox.width, height: boundingBox.height, position: "relative"}}>
        <svg
          viewBox={boundingBox.viewBox}
          style={{position: "absolute", width: boundingBox.width, height: boundingBox.height, overflow: "visible"}}
        >
          <path fill={palette.accent} d={d} />
        </svg>
        <div style={{position: "relative"}}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize,
                fontWeight: 700,
                fontFamily: poppins,
                lineHeight: LINE_HEIGHT,
                textAlign: "center",
                paddingLeft: HORIZONTAL_PADDING,
                paddingRight: HORIZONTAL_PADDING,
                color: palette.text,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        fitTextOnNLines() + measureText() + createRoundedTextBox()
      </div>
    </AbsoluteFill>
  );
};
