import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from "remotion";

import { PaginatedCaptions } from "./Captions";
import { Spectrum } from "./Spectrum";
import {
  BASE_SIZE,
  CAPTIONS_FONT_SIZE,
  CAPTIONS_FONT_WEIGHT,
  LINE_HEIGHT,
  LINES_PER_PAGE,
} from "./constants";
import { Oscilloscope } from "./Oscilloscope";
import { FONT_FAMILY } from "./font";
import { WaitForFonts } from "./WaitForFonts";
import { AudiogramCompositionSchemaType } from "./schema";

export const Audiogram: React.FC<AudiogramCompositionSchemaType> = ({
  visualizer,
  audioFileUrl,
  coverImageUrl,
  titleText,
  titleColor,
  captionsTextColor,
  onlyDisplayCurrentSentence,
  audioOffsetInSeconds,
  captions,
}) => {
  const { durationInFrames, fps, width } = useVideoConfig();

  if (!captions) {
    throw new Error(
      "subtitles should have been provided through calculateMetadata",
    );
  }

  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);
  const baseNumberOfSamples = Number(visualizer.numberOfSamples);

  const textBoxWidth = width - BASE_SIZE * 2;

  return (
    <AbsoluteFill>
      <Sequence from={-audioOffsetInFrames}>
        <Audio pauseWhenBuffering src={audioFileUrl} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            color: "white",
            padding: "48px",
            backgroundColor: "black",
            fontFamily: FONT_FAMILY,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Img
              style={{
                borderRadius: "6px",
                maxHeight: "250px",
              }}
              src={coverImageUrl}
            />
            <div
              style={{
                marginLeft: "48px",
                lineHeight: "1.25",
                fontWeight: 800,
                color: titleColor,
                fontSize: "48px",
              }}
            >
              {titleText}
            </div>
          </div>
          <div>
            {visualizer.type === "oscilloscope" ? (
              <Oscilloscope
                waveColor={visualizer.color}
                padding={visualizer.padding}
                audioSrc={audioFileUrl}
                numberOfSamples={baseNumberOfSamples}
                windowInSeconds={visualizer.windowInSeconds}
                posterization={visualizer.posterization}
                amplitude={visualizer.amplitude}
              />
            ) : visualizer.type === "spectrum" ? (
              <Spectrum
                barColor={visualizer.color}
                audioSrc={audioFileUrl}
                mirrorWave={visualizer.mirrorWave}
                numberOfSamples={baseNumberOfSamples * 4} // since fft is used, we need to increase the number of samples to get a better resolution
                freqRangeStartIndex={visualizer.freqRangeStartIndex}
                waveLinesToDisplay={visualizer.linesToDisplay}
              />
            ) : null}
          </div>
          <WaitForFonts>
            <div
              style={{
                lineHeight: `${LINE_HEIGHT}px`,
                width: textBoxWidth,
                fontWeight: CAPTIONS_FONT_WEIGHT,
                fontSize: CAPTIONS_FONT_SIZE,
                marginTop: BASE_SIZE * 0.5,
              }}
            >
              <PaginatedCaptions
                captions={captions}
                startFrame={audioOffsetInFrames}
                endFrame={audioOffsetInFrames + durationInFrames}
                linesPerPage={LINES_PER_PAGE}
                subtitlesTextColor={captionsTextColor}
                onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
                textBoxWidth={textBoxWidth}
              />
            </div>
          </WaitForFonts>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
