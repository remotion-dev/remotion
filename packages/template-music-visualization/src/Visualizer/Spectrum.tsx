import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";

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

/**
 * Processes raw frequency data into a visually appealing spectrum visualization
 *
 * @param frequencyData - Raw frequency data array from visualizeAudio
 * @param numberOfBars - Number of bars to display in the visualization
 * @param options - Optional configuration
 * @param options.highFreqCutoff - Percentage of high frequencies to include (0-1), default 0.5
 * @param options.baseScale - Minimum scaling factor for frequencies, default 0.3
 * @param options.maxScale - Maximum scaling factor boost for high frequencies, default 3.5
 * @returns Normalized frequency values ready for visualization
 */
const processFrequencyData = (
  frequencyData: number[],
  numberOfBars: number,
  options = {
    highFreqCutoff: 0.5,
    baseScale: 0.3,
    maxScale: 3.5,
  },
) => {
  // Limit the frequency range to avoid ultra-high frequencies
  const maxFreqIndex = Math.floor(
    frequencyData.length * options.highFreqCutoff,
  );

  // Pre-calculate powers and scales to avoid repeated calculations
  const frequencies = new Array(numberOfBars);
  const invNumBars = 1 / numberOfBars;
  const powerCache = new Array(numberOfBars);

  for (let i = 0; i < numberOfBars; i++) {
    const normalizedI = i * invNumBars;
    // Use a gentler power curve that varies based on frequency range
    const power = 3 + normalizedI * 3; // Progressive scaling from 3 to 6
    powerCache[i] = Math.pow(normalizedI, power);
  }

  // Calculate frequencies with logarithmic scaling
  let maxValue = 0.01;
  for (let i = 0; i < numberOfBars; i++) {
    // Get log-scaled index
    const index = Math.min(
      Math.round(Math.pow(maxFreqIndex, i * invNumBars)),
      maxFreqIndex,
    );

    // Get value and apply frequency-dependent scaling
    const value = frequencyData[index];
    const normalizedI = i * invNumBars;

    // More natural scaling that's gentler on low frequencies
    const lowFreqBoost = Math.max(0.8, 1 - normalizedI * 0.3);
    const scale =
      (options.baseScale + powerCache[i] * options.maxScale) * lowFreqBoost;

    // Use different power curves for low vs high frequencies
    const power = 0.8 - normalizedI * 0.2; // Progressive power from 0.8 to 0.6
    const freq = Math.pow(value * scale, power);
    frequencies[i] = freq;
    maxValue = Math.max(maxValue, freq);
  }

  // Normalize values with a slight curve to enhance dynamics
  const invMaxValue = 1 / maxValue;
  for (let i = 0; i < numberOfBars; i++) {
    const normalized = frequencies[i] * invMaxValue;
    frequencies[i] = Math.pow(normalized, 0.9); // Slightly enhance dynamic range
  }

  return frequencies;
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
    return <div className="audio-viz" />;
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
