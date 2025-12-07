import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";

import { Spectrum } from "./Spectrum";
import { AudiogramCompositionSchemaType } from "../helpers/schema";
import { Waveform } from "./Waveform";
import { BassOverlay } from "./BassOverlay";
import { SongInfo } from "./SongInfo";
import { FONT_FAMILY } from "../helpers/font";
import { Audio } from "@remotion/media";

const containerStyle: React.CSSProperties = {
  flexDirection: "column",
  justifyContent: "flex-end",
  color: "white",
  padding: 48,
  gap: 32,
  fontFamily: FONT_FAMILY,
};

const visualizerContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  borderRadius: 32,
  padding: 32,
  marginTop: 32,
};

export const Visualizer: React.FC<AudiogramCompositionSchemaType> = ({
  visualizer,
  audioFileUrl,
  coverImageUrl,
  songName,
  artistName,
  audioOffsetInSeconds,
  textColor,
}) => {
  const { fps } = useVideoConfig();
  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
      }}
    >
      <Sequence from={-audioOffsetInFrames}>
        <BassOverlay audioSrc={audioFileUrl} color={visualizer.color} />
        <Audio src={audioFileUrl} />
        <AbsoluteFill style={containerStyle}>
          <div style={visualizerContainerStyle}>
            {visualizer.type === "oscilloscope" ? (
              <Waveform
                waveColor={visualizer.color}
                audioSrc={audioFileUrl}
                windowInSeconds={visualizer.windowInSeconds}
                amplitude={visualizer.amplitude}
              />
            ) : visualizer.type === "spectrum" ? (
              <Spectrum
                barColor={visualizer.color}
                audioSrc={audioFileUrl}
                mirrorWave={visualizer.mirrorWave}
                numberOfSamples={Number(visualizer.numberOfSamples)}
                waveLinesToDisplay={visualizer.linesToDisplay}
              />
            ) : null}
          </div>
          <SongInfo
            coverImageUrl={coverImageUrl}
            songName={songName}
            artistName={artistName}
            textColor={textColor}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
