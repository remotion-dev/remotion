import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

interface BassOverlayProps {
  audioSrc: string;
  color: string;
}

export const BassOverlay: React.FC<BassOverlayProps> = ({
  audioSrc,
  color,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src: audioSrc,
    frame,
    fps,
    windowInSeconds: 30,
  });

  if (!audioData) {
    return null;
  }

  const values = visualizeAudio({
    audioData,
    fps,
    frame,
    optimizeFor: "speed",
    numberOfSamples: 128,
    dataOffsetInSeconds,
  });

  // Get average of low frequencies to determine flash intensity
  const lowFrequencyValues = values.slice(0, 32);
  const avgLowFreq =
    (lowFrequencyValues.reduce((a, b) => a + b, 0) /
      lowFrequencyValues.length) *
    3;

  // Scale the opacity based on low frequency intensity
  const opacity = Math.min(0.5, avgLowFreq * 0.8);

  return (
    <AbsoluteFill
      style={{
        opacity,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundColor: color,
        }}
      />
    </AbsoluteFill>
  );
};
