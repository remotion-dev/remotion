import { Player } from "@remotion/player";
import {
  smoothenSvgPath,
  useAudioData,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";
import voice from "./voice-short.mp3";

const BaseExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioDataVoice = useAudioData(voice);
  const { width, height } = useVideoConfig();

  if (!audioDataVoice) {
    return null;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame,
    audioData: audioDataVoice,
    numberOfSamples: 32,
    windowInSeconds: 1 / fps,
    channel: 0,
  });

  const p = smoothenSvgPath(
    waveform.map((x, i) => {
      return [
        (i / (waveform.length - 1)) * width,
        (x - 0.5) * 300 + height / 2,
      ];
    })
  );

  return (
    <div style={{ flex: 1 }}>
      <Audio src={voice} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg
          style={{ backgroundColor: " #0B84F3" }}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
        >
          <path stroke="white" fill="none" strokeWidth={10} d={p as string} />
        </svg>
      </AbsoluteFill>
    </div>
  );
};

const MovingExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioDataVoice = useAudioData(voice);
  const { width, height } = useVideoConfig();

  if (!audioDataVoice) {
    return null;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame,
    audioData: audioDataVoice,
    numberOfSamples: 32,
    windowInSeconds: 10 / fps,
    channel: 0,
  });

  const p = smoothenSvgPath(
    waveform.map((x, i) => {
      return [
        (i / (waveform.length - 1)) * width,
        (x - 0.5) * 300 + height / 2,
      ];
    })
  );

  return (
    <div style={{ flex: 1 }}>
      <Audio src={voice} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg
          style={{ backgroundColor: "#0B84F3" }}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
        >
          <path stroke="#ffffff" fill="none" strokeWidth={10} d={p as string} />
        </svg>
      </AbsoluteFill>
    </div>
  );
};

const PosterizedExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioDataVoice = useAudioData(voice);
  const { width, height } = useVideoConfig();

  if (!audioDataVoice) {
    return null;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame: Math.round(frame / 3) * 3,
    audioData: audioDataVoice,
    numberOfSamples: 16,
    windowInSeconds: 1 / fps,
    channel: 0,
  });

  const p = smoothenSvgPath(
    waveform.map((x, i) => {
      return [
        (i / (waveform.length - 1)) * width,
        (x - 0.5) * 300 + height / 2,
      ];
    })
  );

  return (
    <div style={{ flex: 1 }}>
      <Audio src={voice} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg
          style={{ backgroundColor: " #0B84F3" }}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
        >
          <path stroke="white" fill="none" strokeWidth={10} d={p as string} />
        </svg>
      </AbsoluteFill>
    </div>
  );
};

export const AudioWaveFormExample: React.FC<{
  type: "base" | "moving" | "posterized";
}> = ({ type }) => {
  const component = (() => {
    if (type === "base") {
      return BaseExample;
    }

    if (type === "moving") {
      return MovingExample;
    }

    if (type === "posterized") {
      return PosterizedExample;
    }

    throw new TypeError("oops");
  })();
  return (
    <div>
      <Player
        component={component}
        compositionWidth={2160}
        compositionHeight={1080}
        controls
        durationInFrames={300}
        fps={30}
        style={{
          width: "100%",
        }}
        loop
      />
    </div>
  );
};
