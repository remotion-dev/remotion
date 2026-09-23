import {fillTextBox, fitText, fitTextOnNLines, measureText} from "@remotion/layout-utils";
import {createRoundedTextBox} from "@remotion/rounded-text-box";
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const TEXT = "ROUNDED TEXT BOX";
const OUTER_MAX_WIDTH = 700;
const HORIZONTAL_PADDING = 40;
const BORDER_RADIUS = 28;
const LINE_HEIGHT = 1.2;
const LABEL = "fitText() sizes this label to the box width";
const CAPTION_WORDS =
  "fillTextBox() wraps arbitrary text word by word into a fixed number of lines at a fixed font size".split(" ");
const CAPTION_BOX_WIDTH = 620;
const CAPTION_FONT_SIZE = 22;

// Demonstrates every @remotion/layout-utils measuring function:
// fitTextOnNLines()/measureText() + @remotion/rounded-text-box's
// createRoundedTextBox() size the TikTok/Instagram-style rounded box from
// real text measurements; fitText() finds the font size that fits a single
// line of text into a fixed width (used for the label above the box);
// fillTextBox() wraps arbitrary text word-by-word into a fixed number of
// lines at a fixed font size -- the opposite problem from fitTextOnNLines
// (which searches for a font size instead of a line break). All of these
// only work in the browser, which is exactly where a Remotion render runs.
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

  const {fontSize: labelFontSize} = fitText({
    text: LABEL,
    withinWidth: OUTER_MAX_WIDTH,
    fontFamily: poppins,
    fontWeight: "500",
  });

  const captionBox = fillTextBox({maxBoxWidth: CAPTION_BOX_WIDTH, maxLines: 2});
  const captionLines: string[][] = [[], []];
  let captionLineIndex = 0;
  for (const word of CAPTION_WORDS) {
    const {exceedsBox, newLine} = captionBox.add({
      text: ` ${word}`,
      fontFamily: poppins,
      fontWeight: "500",
      fontSize: CAPTION_FONT_SIZE,
    });
    if (exceedsBox) break;
    if (newLine) captionLineIndex += 1;
    captionLines[captionLineIndex].push(word);
  }

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
      <div style={{fontSize: labelFontSize, fontWeight: 500, color: palette.textDim, marginBottom: 12}}>{LABEL}</div>
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
      <div style={{marginTop: 16, textAlign: "center"}}>
        {captionLines.map((line, i) =>
          line.length > 0 ? (
            <div key={i} style={{fontSize: CAPTION_FONT_SIZE, fontWeight: 500, color: palette.textDim}}>
              {line.join(" ")}
            </div>
          ) : null,
        )}
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        fitTextOnNLines() · measureText() · fitText() · fillTextBox()
      </div>
    </AbsoluteFill>
  );
};
