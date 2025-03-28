import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/IBMPlexSans";

import { Spectrum } from "./Spectrum";
import { AudiogramCompositionSchemaType } from "./schema";
import { Waveform } from "./Waveform";

loadFont("normal", {
  weights: ["500", "700"],
});

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  width: "1080px",
  height: "1080px",
  color: "white",
  backgroundColor: "black",
  padding: "48px",
  gap: "32px",
  fontFamily,
};

const visualizerContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  borderRadius: "32px",
  padding: "32px",
  marginTop: "32px",
};

const imageContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "40px",
  background: "rgba(255,255,255,0.02)",
  padding: "32px",
  borderRadius: "32px",
  boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
};

const imageStyle: React.CSSProperties = {
  width: "280px",
  height: "280px",
  objectFit: "cover",
  borderRadius: "20px",
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
        <Audio pauseWhenBuffering src={audioFileUrl} />
        <div style={containerStyle}>
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

            <div className="text-overlay">
              <div
                className="song-name"
                style={{
                  fontSize: "5.5rem",
                  fontWeight: "700",
                  marginBottom: "16px",
                  lineHeight: "1.1",
                  color: textColor,
                  letterSpacing: "-0.02em",
                  textShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {songName}
              </div>
              <div
                className="artist-name"
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "500",
                  opacity: "0.9",
                  letterSpacing: "0.01em",
                  color: textColor,
                  textShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {artistName}
              </div>
            </div>
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
