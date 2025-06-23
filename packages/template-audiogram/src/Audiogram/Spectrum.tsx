import { visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioDataIfPossible } from "../helpers/use-windowed-audio-data-if-possible";
import { AudioVizContainer } from "./AudioVizContainer";
import { BASE_SIZE } from "./constants";

const Bar: React.FC<{ height: number; color: string }> = ({
  height,
  color,
}) => {
  const barStyle: React.CSSProperties = {
    borderRadius: `${BASE_SIZE * 0.25}px`,
    width: `${BASE_SIZE * 0.5}px`,
    height: `${height}px`,
    backgroundColor: color,
  };

  return <div style={barStyle} />;
};

export const Spectrum: React.FC<{
  readonly barColor: string;
  readonly numberOfSamples: number;
  readonly freqRangeStartIndex: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioSrc: string;
}> = ({
  barColor,
  numberOfSamples,
  freqRangeStartIndex,
  waveLinesToDisplay,
  mirrorWave,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { audioData, dataOffsetInSeconds } = useWindowedAudioDataIfPossible({
    src: audioSrc,
    fps,
    frame,
    windowInSeconds: 10,
  });

  if (!audioData) {
    return <AudioVizContainer />;
  }

  const frequencyData = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples, // Use more samples to get a nicer visualisation
    optimizeFor: "speed",
    dataOffsetInSeconds,
  });

  // Pick the low values because they look nicer than high values
  // feel free to play around :)
  const frequencyDataSubset = frequencyData.slice(
    freqRangeStartIndex,
    freqRangeStartIndex +
      (mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay),
  );

  const frequenciesToDisplay = mirrorWave
    ? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
    : frequencyDataSubset;

  return (
    <AudioVizContainer>
      {frequenciesToDisplay.map((v, i) => {
        return <Bar key={i} height={300 * Math.sqrt(v)} color={barColor} />;
      })}
    </AudioVizContainer>
  );
};
