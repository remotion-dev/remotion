export const MODELS = [
  { id: "gpt-5.2:none", name: "GPT-5.2 (No Reasoning)" },
  { id: "gpt-5.2:low", name: "GPT-5.2 (Low Reasoning)" },
  { id: "gpt-5.2:medium", name: "GPT-5.2 (Medium Reasoning)" },
  { id: "gpt-5.2:high", name: "GPT-5.2 (High Reasoning)" },
  { id: "gpt-5.2-pro:medium", name: "GPT-5.2 Pro (Medium)" },
  { id: "gpt-5.2-pro:high", name: "GPT-5.2 Pro (High)" },
  { id: "gpt-5.2-pro:xhigh", name: "GPT-5.2 Pro (XHigh)" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type StreamPhase = "idle" | "reasoning" | "generating";

export type GenerationErrorType = "validation" | "api";
