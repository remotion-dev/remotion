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
  visualizerType,
  audioFileUrl,
  coverImageUrl,
  titleText,
  titleColor,
  captionsTextColor: subtitlesTextColor,
  captionsLinePerPage: subtitlesLinePerPage,
  visualizerColor,
  visualizerNumberOfSamples,
  visualizerFreqRangeStartIndex: waveFreqRangeStartIndex,
  visualizerLinesToDisplay: waveLinesToDisplay,
  captionsZoomMeasurerSize: subtitlesZoomMeasurerSize,
  captionsLineHeight: subtitlesLineHeight,
  onlyDisplayCurrentSentence,
  visualizerMirror: mirrorWave,
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
  const baseNumberOfSamples = Number(visualizerNumberOfSamples);

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
            {visualizerType === "oscilloscope" ? (
              <Oscilloscope
                waveColor={visualizerColor}
                padding={50}
                audioSrc={audioFileUrl}
                numberOfSamples={baseNumberOfSamples}
                windowInSeconds={0.1}
                posterization={3}
                amplitude={4}
              />
            ) : visualizerType === "spectrum" ? (
              <Spectrum
                barColor={visualizerColor}
                audioSrc={audioFileUrl}
                mirrorWave={mirrorWave}
                numberOfSamples={baseNumberOfSamples * 4} // since fft is used, we need to increase the number of samples to get a better resolution
                freqRangeStartIndex={waveFreqRangeStartIndex}
                waveLinesToDisplay={waveLinesToDisplay}
              />
            ) : null}
          </div>
          <div
            style={{ lineHeight: `${subtitlesLineHeight}px` }}
            className="captions"
          >
            <PaginatedCaptions
              captions={captions}
              startFrame={audioOffsetInFrames}
              endFrame={audioOffsetInFrames + durationInFrames}
              linesPerPage={subtitlesLinePerPage}
              subtitlesTextColor={subtitlesTextColor}
              subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
              subtitlesLineHeight={subtitlesLineHeight}
              onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
            />
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
