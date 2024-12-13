import { visualizeAudio } from "@remotion/media-utils";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioDataIfPossible } from "../helpers/use-windowed-audio-data-if-possible";

export const Waveform: React.FC<{
  readonly waveColor: string;
  readonly numberOfSamples: number;
  readonly freqRangeStartIndex: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioSrc: string;
}> = ({
  waveColor,
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
    return null;
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
    <div className="audio-viz">
      {frequenciesToDisplay.map((v, i) => {
        return (
          <div
            key={i}
            className="bar"
            style={{
              minWidth: "1px",
              backgroundColor: waveColor,
              height: `${500 * Math.sqrt(v)}%`,
            }}
          />
        );
      })}
    </div>
  );
};
