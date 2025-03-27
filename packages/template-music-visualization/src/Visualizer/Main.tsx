import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useVideoConfig } from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/IBMPlexSans";
import "./style.css";

import { Spectrum } from "./Spectrum";
import { AudiogramCompositionSchemaType } from "./schema";
import { Oscilloscope } from "./Oscilloscope";

loadFont("normal", {
  weights: ["500", "700"],
});

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
  const baseNumberOfSamples = Number(visualizer.numberOfSamples);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
      }}
    >
      <Sequence from={-audioOffsetInFrames}>
        <Audio pauseWhenBuffering src={audioFileUrl} />
        <div
          className="container"
          style={{
            fontFamily,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px",
            gap: "32px",
          }}
        >
          <div
            className="visualizer-container"
            style={{
              width: "100%",
              borderRadius: "32px",
              padding: "32px",
              marginTop: "32px",
            }}
          >
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
                numberOfSamples={baseNumberOfSamples * 4}
                waveLinesToDisplay={visualizer.linesToDisplay}
              />
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              background: "rgba(255,255,255,0.02)",
              padding: "32px",
              borderRadius: "32px",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
            }}
          >
            <Img
              style={{
                width: "280px",
                height: "280px",
                objectFit: "cover",
                borderRadius: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
              src={coverImageUrl}
            />

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
