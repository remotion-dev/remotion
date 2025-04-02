import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/IBMPlexSans";

import { Spectrum } from "./Spectrum";
import { AudiogramCompositionSchemaType } from "./schema";
import { Waveform } from "./Waveform";
import { BassOverlay } from "./BassOverlay";

loadFont("normal", {
  weights: ["500", "700"],
});

const containerStyle: React.CSSProperties = {
  flexDirection: "column",
  justifyContent: "flex-end",
  color: "white",
  backgroundColor: "black",
  padding: 48,
  gap: 32,
  fontFamily,
};

const visualizerContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  borderRadius: 32,
  padding: 32,
  marginTop: 32,
};

const imageContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 40,
  background: "rgba(255, 255, 255, 0.02)",
  padding: 32,
  borderRadius: 32,
  boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
};

const imageStyle: React.CSSProperties = {
  width: 280,
  height: 280,
  objectFit: "cover",
  borderRadius: 20,
  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
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
        <Audio pauseWhenBuffering src={audioFileUrl} />
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

          <div style={imageContainerStyle}>
            <Img style={imageStyle} src={coverImageUrl} />

            <div>
              <div
                style={{
                  fontSize: "5.5rem",
                  fontWeight: "700",
                  marginBottom: 16,
                  lineHeight: "1.1",
                  color: textColor,
                  letterSpacing: "-0.02em",
                  textShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {songName}
              </div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "500",
                  opacity: 0.9,
                  color: textColor,
                  textShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {artistName}
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
