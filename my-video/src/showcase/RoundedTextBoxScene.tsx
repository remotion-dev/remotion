import {loadFont} from "@remotion/fonts";
import {getAvailableFonts} from "@remotion/google-fonts";
import {getInfo} from "@remotion/google-fonts/Poppins";
import {fillTextBox, fitText, fitTextOnNLines, measureText} from "@remotion/layout-utils";
import {createRoundedTextBox} from "@remotion/rounded-text-box";
import {useEffect, useMemo, useState} from "react";
import {AbsoluteFill, spring, staticFile, useCurrentFrame, useDelayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const LOCAL_FONT_FAMILY = "Bangers";

// Lowercase on purpose: textTransform uppercases it, and the measuring
// functions get the same textTransform/letterSpacing as the CSS below, so
// the box is sized to the text as it is actually drawn.
const TEXT = "rounded text box";
const TEXT_TRANSFORM = "uppercase";
const LETTER_SPACING = "0.06em";
const OUTER_MAX_WIDTH = 700;
const HORIZONTAL_PADDING = 40;
const BORDER_RADIUS = 28;
const LINE_HEIGHT = 1.2;
const LABEL = "fitText() sizes this label to 700px";
// Tabular digits change the width of "700", so fitText() is told about it too.
const LABEL_NUMERIC = "tabular-nums";
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
// Also demonstrates @remotion/fonts' loadFont() -- self-hosting a font FILE
// directly (bangers.woff2), rather than fetching a Google Font by name the
// way @remotion/google-fonts' own loadFont() does -- and that package's
// getAvailableFonts() catalog-browsing function. font.ts's Poppins does NOT
// use @remotion/google-fonts' loadFont() -- a real render test showed
// fonts.gstatic.com fails inside this sandbox's actual rendering Chromium
// even though it answers a plain curl; see font.ts and AGENTS.md.
export const RoundedTextBoxScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender(`loading self-hosted ${LOCAL_FONT_FAMILY} font`));
  const [localFontReady, setLocalFontReady] = useState(false);

  useEffect(() => {
    loadFont({
      family: LOCAL_FONT_FAMILY,
      url: staticFile("bangers.woff2"),
      format: "woff2",
      // weight/style say which face of the family this file is. 400/normal
      // match the FontFace defaults, so here they only document it; a family
      // with several files needs one loadFont() per weight/style. display
      // "block" hides text until the font loads instead of flashing a
      // fallback. unicodeRange limits this face to printable ASCII, so any
      // other character silently falls back to the next font in the stack.
      weight: "400",
      style: "normal",
      display: "block",
      unicodeRange: "U+0020-007E",
    })
      .then(() => {
        setLocalFontReady(true);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle, continueRender, cancelRender]);

  const {fontSize, lines} = fitTextOnNLines({
    text: TEXT,
    maxBoxWidth: OUTER_MAX_WIDTH - HORIZONTAL_PADDING * 2,
    maxLines: 1,
    fontFamily: poppins,
    fontWeight: "700",
    textTransform: TEXT_TRANSFORM,
    letterSpacing: LETTER_SPACING,
    maxFontSize: 64,
  });

  const {fontSize: labelFontSize} = fitText({
    text: LABEL,
    withinWidth: OUTER_MAX_WIDTH,
    fontFamily: poppins,
    fontWeight: "500",
    fontVariantNumeric: LABEL_NUMERIC,
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
      textTransform: TEXT_TRANSFORM,
      letterSpacing: LETTER_SPACING,
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

  // getAvailableFonts() is the catalog-browsing half of @remotion/google-fonts:
  // it lists every font the package knows about, without fetching anything.
  // No scene loads a Google Font. font.ts's `poppins` is a system font stack,
  // because fonts.gstatic.com fails inside this sandbox's renderer.
  const availableFonts = useMemo(() => getAvailableFonts(), []);
  const poppinsListed = availableFonts.some((f) => f.fontFamily === "Poppins");
  // getInfo() is the per-font metadata loadFont() works from: every weight,
  // style and subset, with its fonts.gstatic.com URL. Reading it fetches
  // nothing, so unlike loadFont() it works in this sandbox. Its subsets are
  // why the real Poppins can't set Vietnamese: there is no "vietnamese" one,
  // so letters such as ế and ữ would come from a fallback font mid-word (see
  // "Language" in AGENTS.md).
  const poppinsInfo = useMemo(() => getInfo(), []);
  const poppinsVietnamese = poppinsInfo.subsets.some((subset) => subset === "vietnamese");

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/rounded-text-box · sized from real text measurements
      </div>
      <div style={{fontSize: labelFontSize, fontWeight: 500, fontVariantNumeric: LABEL_NUMERIC, color: palette.textDim, marginBottom: 12}}>{LABEL}</div>
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
                textTransform: TEXT_TRANSFORM,
                letterSpacing: LETTER_SPACING,
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
      {localFontReady ? (
        <div style={{marginTop: 18, fontFamily: LOCAL_FONT_FAMILY, fontSize: 34, color: palette.accent2}}>
          loadFont(): self-hosted {LOCAL_FONT_FAMILY}, weight 400, U+0020-007E
        </div>
      ) : null}
      <div style={{marginTop: 10, fontSize: 14, color: palette.textDim, fontFamily: "monospace", textAlign: "center"}}>
        <div>
          getAvailableFonts(): {availableFonts.length} Google Fonts (Poppins listed: {String(poppinsListed)})
        </div>
        <div>
          Poppins getInfo(): {Object.keys(poppinsInfo.fonts.normal).length} weights × {Object.keys(poppinsInfo.fonts).length} styles ·
          subsets: {poppinsInfo.subsets.join(", ")} · includes "vietnamese": {String(poppinsVietnamese)}
        </div>
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.text, fontSize: 32, fontWeight: 600}}>
        fitTextOnNLines() · measureText() · fitText() · fillTextBox() · loadFont()
      </div>
    </AbsoluteFill>
  );
};
