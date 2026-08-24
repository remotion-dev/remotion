import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  Interactive,
  staticFile,
  useVideoConfig,
} from "remotion";
import { PaginatedCaptions } from "./Captions";
import { Oscilloscope } from "./Oscilloscope";
import { Spectrum } from "./Spectrum";
import { WaitForFonts } from "./WaitForFonts";
import {
  BASE_SIZE,
  CAPTIONS_FONT_SIZE,
  CAPTIONS_FONT_WEIGHT,
  LINE_HEIGHT,
  LINES_PER_PAGE,
} from "./constants";
import { FONT_FAMILY } from "./font";
import type { AudiogramCompositionSchemaType } from "./schema";

export const Audiogram: React.FC<AudiogramCompositionSchemaType> = ({
  visualizer,
  audioFileUrl,
  titleColor,
  captionsTextColor,
  onlyDisplayCurrentSentence,
  captions,
}) => {
  const { durationInFrames, width } = useVideoConfig();

  if (!captions) {
    throw new Error(
      "subtitles should have been provided through calculateMetadata",
    );
  }

  const baseNumberOfSamples = Number(visualizer.numberOfSamples);

  const textBoxWidth = width - BASE_SIZE * 2;

  return (
    <AbsoluteFill>
      <Audio src={audioFileUrl} />
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
            src={staticFile("podcast-cover.jpeg")}
          />
          <Interactive.Div
            style={{
              marginLeft: "48px",
              lineHeight: "1.25",
              fontWeight: 800,
              color: titleColor,
              fontSize: "48px",
            }}
            name={"Episode Title"}
          >
            Ep 550 - Supper Club × Remotion React
          </Interactive.Div>
        </div>
        <div>
          {visualizer.type === "oscilloscope" ? (
            <Oscilloscope
              waveColor={visualizer.color}
              padding={visualizer.padding}
              audioSrc={audioFileUrl}
              key={audioFileUrl}
              numberOfSamples={baseNumberOfSamples}
              windowInSeconds={visualizer.windowInSeconds}
              posterization={visualizer.posterization}
              amplitude={visualizer.amplitude}
            />
          ) : visualizer.type === "spectrum" ? (
            <Spectrum
              barColor={visualizer.color}
              audioSrc={audioFileUrl}
              key={audioFileUrl}
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
              startFrame={0}
              endFrame={durationInFrames}
              linesPerPage={LINES_PER_PAGE}
              subtitlesTextColor={captionsTextColor}
              onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
              textBoxWidth={textBoxWidth}
            />
          </div>
        </WaitForFonts>
      </div>
    </AbsoluteFill>
  );
};
