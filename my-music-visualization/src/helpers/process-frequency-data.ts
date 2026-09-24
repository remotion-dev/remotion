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
export const processFrequencyData = (
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
