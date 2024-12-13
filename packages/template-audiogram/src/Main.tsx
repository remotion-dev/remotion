import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from "remotion";

import { PaginatedSubtitles } from "./Subtitles";
import { AudioViz } from "./AudioViz";
import { AudiogramCompositionSchemaType } from "./schema";

export const Main: React.FC<AudiogramCompositionSchemaType> = ({
  audioFileName,
  coverImgFileName,
  titleText,
  titleColor,
  subtitlesTextColor,
  subtitlesLinePerPage,
  waveColor,
  waveNumberOfSamples,
  waveFreqRangeStartIndex,
  waveLinesToDisplay,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
  mirrorWave,
  audioOffsetInSeconds,
  subtitles,
}) => {
  const { durationInFrames, fps } = useVideoConfig();

  if (!subtitles) {
    throw new Error(
      "subtitles should have been provided through calculateMetadata",
    );
  }

  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);

  return (
    <AbsoluteFill>
      <Sequence from={-audioOffsetInFrames}>
        <Audio pauseWhenBuffering src={audioFileName} />
        <div
          className="container"
          style={{
            fontFamily: "IBM Plex Sans",
          }}
        >
          <div className="row">
            <Img className="cover" src={coverImgFileName} />
            <div className="title" style={{ color: titleColor }}>
              {titleText}
            </div>
          </div>
          <AudioViz
            audioSrc={audioFileName}
            mirrorWave={mirrorWave}
            waveColor={waveColor}
            numberOfSamples={Number(waveNumberOfSamples)}
            freqRangeStartIndex={waveFreqRangeStartIndex}
            waveLinesToDisplay={waveLinesToDisplay}
          />
          <div
            style={{ lineHeight: `${subtitlesLineHeight}px` }}
            className="captions"
          >
            <PaginatedSubtitles
              subtitles={subtitles}
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
