import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/IBMPlexSans";
import "./style.css";

import { PaginatedCaptions } from "./Captions";
import { Spectrum } from "./Spectrum";
import { AudiogramCompositionSchemaType } from "./schema";
import { Oscilloscope } from "./Oscilloscope";

loadFont("normal", {
  weights: ["500"],
});

export const Audiogram: React.FC<AudiogramCompositionSchemaType> = ({
  visualizer,
  audioFileUrl,
  coverImageUrl,
  titleText,
  titleColor,
  captionsTextColor,
  captionsLinePerPage,
  captionsZoomMeasurerSize,
  captionsLineHeight,
  onlyDisplayCurrentSentence,
  audioOffsetInSeconds,
  captions,
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  if (!captions) {
    throw new Error(
      "subtitles should have been provided through calculateMetadata",
    );
  }

  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);
  const baseNumberOfSamples = Number(visualizer.numberOfSamples);

  return (
    <AbsoluteFill>
      <Sequence from={-audioOffsetInFrames}>
        <Audio pauseWhenBuffering src={audioFileUrl} />
        <div
          className="container"
          style={{
            fontFamily,
          }}
        >
          <div className="row">
            <Img className="cover" src={coverImageUrl} />
            <div className="title" style={{ color: titleColor }}>
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
          <div
            style={{ lineHeight: `${captionsLineHeight}px` }}
            className="captions"
          >
            <PaginatedCaptions
              captions={captions}
              startFrame={audioOffsetInFrames}
              endFrame={audioOffsetInFrames + durationInFrames}
              linesPerPage={captionsLinePerPage}
              subtitlesTextColor={captionsTextColor}
              subtitlesZoomMeasurerSize={captionsZoomMeasurerSize}
              subtitlesLineHeight={captionsLineHeight}
              onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
            />
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
