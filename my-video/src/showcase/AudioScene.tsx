import {Audio} from "remotion";
import {createSmoothSvgPath, useWindowedAudioData, visualizeAudioWaveform} from "@remotion/media-utils";
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const HEIGHT = 220;

// Demonstrates: @remotion/media-utils — useWindowedAudioData() loading real
// audio, visualizeAudioWaveform() sampling it per-frame, and
// createSmoothSvgPath() turning the samples into an oscilloscope-style line,
// alongside <Audio> actually playing the track. sample-tone.wav is a locally
// synthesized two-tone sine wave — see scripts/generate-sample-media.mjs.
export const AudioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();

  const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
    src: staticFile("sample-tone.wav"),
    frame,
    fps,
    windowInSeconds: 3,
  });

  const waveform = audioData
    ? visualizeAudioWaveform({
        fps,
        frame,
        audioData,
        numberOfSamples: 256,
        windowInSeconds: 0.5,
        dataOffsetInSeconds,
      })
    : null;

  const path = waveform
    ? createSmoothSvgPath({
        points: waveform.map((y, i) => ({
          x: (i / (waveform.length - 1)) * width,
          y: HEIGHT / 2 + (y * HEIGHT) / 2,
        })),
      })
    : null;

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/media-utils · visualizeAudioWaveform + createSmoothSvgPath
      </div>
      {path ? (
        <svg width={width} height={HEIGHT}>
          <path d={path} fill="none" stroke={palette.accent2} strokeWidth={3} />
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width,
          textAlign: "center",
          color: palette.text,
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        A real waveform, not an animated placeholder
      </div>
      <Audio src={staticFile("sample-tone.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
