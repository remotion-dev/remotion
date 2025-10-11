import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { processFrequencyData } from "../helpers/process-frequency-data";

const spectrumContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  height: "30rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0px",
  overflow: "hidden",
  width: "100%",
};

export const Spectrum: React.FC<{
  readonly barColor: string;
  readonly numberOfSamples: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioSrc: string;
}> = ({
  barColor,
  numberOfSamples,
  waveLinesToDisplay,
  mirrorWave,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return <div style={spectrumContainer} />;
  }

  const frequencyData = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples,
    optimizeFor: "speed",
  });

  const normalizedData = processFrequencyData(
    frequencyData,
    waveLinesToDisplay,
  );

  const frequenciesToDisplay = mirrorWave
    ? [...normalizedData.slice(1).reverse(), ...normalizedData]
    : normalizedData;

  return (
    <div style={spectrumContainer}>
      {frequenciesToDisplay.map((v, i) => {
        return (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: barColor,
              height: `${Math.min(100, 80 * v)}%`,
              borderRadius: "8px",
              margin: "0 0.3%",
              minWidth: "1px",
            }}
          />
        );
      })}
    </div>
  );
};
