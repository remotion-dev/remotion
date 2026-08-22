import type { Caption } from "@remotion/captions";

type NumberOfSamples = "32" | "64" | "128" | "256" | "512";

type BaseVisualizer = {
  readonly color: string;
  readonly numberOfSamples: NumberOfSamples;
};

type SpectrumVisualizer = BaseVisualizer & {
  readonly type: "spectrum";
  readonly linesToDisplay: number;
  readonly freqRangeStartIndex: number;
  readonly mirrorWave: boolean;
};

type OscilloscopeVisualizer = BaseVisualizer & {
  readonly type: "oscilloscope";
  readonly windowInSeconds: number;
  readonly posterization: number;
  readonly amplitude: number;
  readonly padding: number;
};

export type AudiogramProps = {
  readonly visualizer: SpectrumVisualizer | OscilloscopeVisualizer;
  readonly titleColor: string;
  readonly captionsFileName: string;
  readonly captionsTextColor: string;
  readonly onlyDisplayCurrentSentence: boolean;
  readonly audioFileUrl: string;
  readonly captions: Caption[] | null;
};
