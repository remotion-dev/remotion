import {
  WHISPER_WEBGPU_MODELS,
  WHISPER_WEBGPU_SAMPLE_RATE,
  canUseWhisperWebGpu,
  clearStaleModels,
  disposeWhisperModel,
  getAvailableModels,
  isWhisperModelCached,
  loadWhisperModel,
  removeWhisperModel,
  resampleTo16Khz,
  toCaptions,
  transcribe,
} from "@remotion/whisper-webgpu";
import {useEffect, useState} from "react";
import {AbsoluteFill, staticFile, useDelayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Status =
  | {state: "checking"}
  | {state: "unsupported"; reason: string}
  | {state: "ready"; extra: string}
  | {state: "load-failed"; extra: string};

// Demonstrates: @remotion/whisper-webgpu — transcribing audio locally in
// the browser over WebGPU (Transformers.js), no server round-trip and no
// API key, converting straight to @remotion/captions' Caption[] format via
// toCaptions(). See browser-transcription.md. Like the video-matting
// scene, the model download from remotion.media can fail for real users
// too (network, an unsupported browser), so this checks support and
// handles a failed load gracefully rather than assuming success. Also
// exercises the parts of the API that don't need a downloaded model:
// getAvailableModels()/isWhisperModelCached()/clearStaleModels() (cache
// bookkeeping, no network), the raw WHISPER_WEBGPU_MODELS id list and
// WHISPER_WEBGPU_SAMPLE_RATE constant getAvailableModels()/
// resampleTo16Khz() wrap, resampleTo16Khz() itself (a real Web Audio decode
// of sample-tone.wav), and toCaptions() (a pure Caption[] conversion, fed a
// hand-built transcription result rather than a real model's output, since
// there's no way to get real words without the model). transcribe() is
// still attempted for real against the resampled waveform — expected to
// fail here since no model loaded.
export const BrowserTranscriptionScene: React.FC = () => {
  const {width} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("checking whisper-webgpu support", {timeoutInMilliseconds: 20000}));
  const [status, setStatus] = useState<Status>({state: "checking"});

  useEffect(() => {
    (async () => {
      try {
        const support = await canUseWhisperWebGpu();
        if (!support.supported) {
          setStatus({state: "unsupported", reason: support.reason ?? "unknown"});
          continueRender(handle);
          return;
        }

        await clearStaleModels();
        const availableModels = getAvailableModels();
        const cachedBeforeLoad = await isWhisperModelCached({model: "small.en"});

        const response = await fetch(staticFile("sample-tone.wav"));
        const waveform = await resampleTo16Khz({file: await response.blob()});

        const {captions} = toCaptions({
          whisperWebGpuOutput: {
            text: "hello world",
            model: "small.en",
            words: [
              {text: "hello", startInSeconds: 0, endInSeconds: 0.4},
              {text: "world", startInSeconds: 0.4, endInSeconds: 0.9},
            ],
          },
        });

        let extra = `${availableModels.length} models (${WHISPER_WEBGPU_MODELS.length} raw ids), cached: ${cachedBeforeLoad}, resampled: ${waveform.length} samples @ ${WHISPER_WEBGPU_SAMPLE_RATE}Hz, toCaptions(): ${captions.length} captions`;

        try {
          await loadWhisperModel({model: "small.en"});
          try {
            await transcribe({channelWaveform: waveform, model: "small.en"});
            extra += ", transcribe: succeeded";
          } catch {
            extra += ", transcribe: failed";
          }
          await removeWhisperModel({model: "small.en"});
          setStatus({state: "ready", extra});
        } catch {
          await disposeWhisperModel({model: "small.en"});
          setStatus({state: "load-failed", extra});
        }
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    })();
  }, [handle, continueRender, cancelRender]);

  const line = (() => {
    switch (status.state) {
      case "checking":
        return "Checking WebGPU support…";
      case "unsupported":
        return `WebGPU unavailable here (${status.reason}) — falls back gracefully`;
      case "ready":
        return "Model ready (small.en) — transcribing, no server round-trip";
      case "load-failed":
        return "WebGPU supported, model download failed — falls back gracefully";
    }
  })();

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/whisper-webgpu · in-browser transcription
      </div>
      <div style={{fontSize: 30, fontWeight: 600, color: palette.text, textAlign: "center", maxWidth: 1000, padding: "0 40px"}}>
        {line}
      </div>
      {status.state === "ready" || status.state === "load-failed" ? (
        <div style={{fontSize: 16, color: palette.textDim, marginTop: 16, fontFamily: "monospace", textAlign: "center"}}>
          {status.extra}
        </div>
      ) : null}
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Speech to @remotion/captions, entirely client-side
      </div>
    </AbsoluteFill>
  );
};
