import {
  getPartialWaveData,
  probeWaveFile,
  useAudioData,
  visualizeAudio,
} from "@remotion/media-utils";
import { useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

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

  useEffect(() => {
    probeWaveFile(audioSrc)
      .then((result) => {
        return getPartialWaveData({
          bitsPerSample: result.bitsPerSample,
          blockAlign: result.blockAlign,
          dataOffset: result.dataOffset,
          fileSize: result.fileSize,
          fromSeconds: 0,
          sampleRate: result.sampleRate,
          src: audioSrc,
          toSeconds: 1,
          channelIndex: 0,
        });
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [audioSrc]);

  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return null;
  }

  const frequencyData = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples, // Use more samples to get a nicer visualisation
    optimizeFor: "speed",
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
