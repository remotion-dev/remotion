import {
  createSmoothSvgPath,
  useWindowedAudioData,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface WaveformContainerProps {
  children?: React.ReactNode;
}

const WAVEFORM_HEIGHT = 400;

const waveformContainerStyle: React.CSSProperties = {
  height: WAVEFORM_HEIGHT,
};

const WaveformContainer: React.FC<WaveformContainerProps> = ({ children }) => {
  const { width } = useVideoConfig();

  return (
    <svg
      viewBox={`0 0 ${width} ${WAVEFORM_HEIGHT}`}
      style={waveformContainerStyle}
      width={width}
      height={WAVEFORM_HEIGHT}
    >
      {children}
    </svg>
  );
};

// automatically calculate the number of samples based on the window size
// this is to ensure that amplitude normalization doesn't make the waveform unstable when the window size is bigger
function calculateNumberOfSamples(windowInSeconds: number) {
  const baseSampleCount = 2048; // Base sample count for 1 second

  if (windowInSeconds <= 1) {
    return baseSampleCount;
  }

  // Scale samples proportionally with window size, with some constraints
  const scaledSamples = Math.floor(baseSampleCount * windowInSeconds);

  // Clamp the value between 2048 and 8192
  return Math.min(Math.max(scaledSamples, 2048), 8192);
}

interface WaveformProps {
  audioSrc: string;
  windowInSeconds: number;
  amplitude: number;
  waveColor: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  windowInSeconds,
  amplitude,
  audioSrc,
  waveColor,
}) => {
  const { width, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src: audioSrc,
    frame,
    fps,
    windowInSeconds: 30,
  });

  const numberOfSamples = useMemo(
    () => calculateNumberOfSamples(windowInSeconds),
    [windowInSeconds],
  );

  if (!audioData) {
    return <WaveformContainer />;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame,
    audioData,
    numberOfSamples,
    windowInSeconds: windowInSeconds,
    channel: 0,
    dataOffsetInSeconds,
  });

  const p = createSmoothSvgPath({
    points: waveform.map((y, i) => {
      return {
        x: (i / (waveform.length - 1)) * width,
        y: WAVEFORM_HEIGHT / 2 + ((y * WAVEFORM_HEIGHT) / 2) * amplitude,
      };
    }),
  });

  return (
    <WaveformContainer>
      <path
        strokeLinecap="round"
        fill="none"
        stroke={waveColor}
        strokeWidth={2}
        d={p}
      />
    </WaveformContainer>
  );
};
