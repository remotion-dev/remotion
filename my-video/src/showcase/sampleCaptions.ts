import type {Caption} from "@remotion/captions";

// Hand-written stand-in for a transcript. In a real project this would come
// from @remotion/install-whisper-cpp or @remotion/openai-whisper (see the
// remotion-captions skill's transcribe-captions.md) instead of being typed
// out by hand. Kept under ~2.3s so it fits inside the scene's 75-frame
// (2.5s) budget in the TransitionSeries.
export const sampleCaptions: Caption[] = [
  {text: "This ", startMs: 0, endMs: 220, timestampMs: null, confidence: null},
  {text: "is ", startMs: 220, endMs: 360, timestampMs: null, confidence: null},
  {text: "Remotion: ", startMs: 360, endMs: 760, timestampMs: null, confidence: null},
  {text: "videos ", startMs: 760, endMs: 1000, timestampMs: null, confidence: null},
  {text: "made ", startMs: 1000, endMs: 1180, timestampMs: null, confidence: null},
  {text: "with ", startMs: 1180, endMs: 1320, timestampMs: null, confidence: null},
  {text: "real ", startMs: 1320, endMs: 1520, timestampMs: null, confidence: null},
  {text: "code, ", startMs: 1520, endMs: 1840, timestampMs: null, confidence: null},
  {text: "not ", startMs: 1840, endMs: 1980, timestampMs: null, confidence: null},
  {text: "timelines.", startMs: 1980, endMs: 2320, timestampMs: null, confidence: null},
];
