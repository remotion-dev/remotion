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
import type {TranscribeOptions} from "@remotion/whisper-webgpu";
import {useEffect, useState} from "react";
import {AbsoluteFill, staticFile, useDelayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Row = {label: string; value: string};

type Status =
  | {state: "checking"}
  | {state: "unsupported"; reason: string; rows: Row[]}
  | {state: "ready"; rows: Row[]}
  | {state: "load-failed"; rows: Row[]};

// Demonstrates: @remotion/whisper-webgpu — transcribing audio locally in
// the browser over WebGPU (Transformers.js), no server round-trip and no
// API key, converting straight to @remotion/captions' Caption[] format via
// toCaptions(). See browser-transcription.md. Like the video-matting
// scene, the model download from remotion.media can fail for real users
// too (network, an unsupported browser), so this checks support and
// handles a failed load gracefully rather than assuming success.
//
// The first rows need neither WebGPU nor a model, so they run in every
// case: which models are multilingual and which can translate
// (getAvailableModels(), the choice that matters for Vietnamese speech),
// resampleTo16Khz() with its progress steps (a real Web Audio decode of
// sample-tone.wav), toCaptions() on a hand-built result, and three
// transcribe() calls that its own option checks reject. The rest depends
// on WebGPU: isWhisperModelCached()/clearStaleModels() (cache bookkeeping),
// then loadWhisperModel(). Only if the load succeeds does transcribe() run
// on the waveform, and its real words go through toCaptions(). Here the
// download is blocked, so that last step never runs in this sandbox.
export const BrowserTranscriptionScene: React.FC = () => {
  const {width} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("checking whisper-webgpu support", {timeoutInMilliseconds: 20000}));
  const [status, setStatus] = useState<Status>({state: "checking"});

  useEffect(() => {
    (async () => {
      try {
        const rows: Row[] = [];
        const names = (models: {name: string}[]) => models.map((m) => m.name).join(", ");

        const models = getAvailableModels();
        const multilingual = models.filter((m) => m.multilingual);
        const translating = models.filter((m) => m.supportsTranslation);
        rows.push({label: "getAvailableModels() multilingual", value: `${multilingual.length} of ${models.length} (${WHISPER_WEBGPU_MODELS.length} raw ids): ${names(multilingual)}`});
        rows.push({
          label: "supportsTranslation",
          value: `${translating.length} of ${models.length}: ${names(translating)} · multilingual without it: ${names(multilingual.filter((m) => !m.supportsTranslation))}`,
        });

        const response = await fetch(staticFile("sample-tone.wav"));
        const steps: number[] = [];
        const waveform = await resampleTo16Khz({file: await response.blob(), onProgress: (p) => steps.push(p)});
        rows.push({label: "resampleTo16Khz({onProgress})", value: `${steps.join(" → ")} · ${waveform.length} samples @ ${WHISPER_WEBGPU_SAMPLE_RATE}Hz`});

        const handBuilt = toCaptions({
          whisperWebGpuOutput: {
            text: "hello world",
            model: "small.en",
            words: [
              {text: "hello", startInSeconds: 0, endInSeconds: 0.4},
              {text: "world", startInSeconds: 0.4, endInSeconds: 0.9},
            ],
          },
        });
        rows.push({label: "toCaptions(hand-built words)", value: `${handBuilt.captions.length} captions`});

        // transcribe() checks model/language/task before it loads anything
        // (whisper-webgpu's transcribe.ts), so these rejections are real and
        // need no download. Each gets 1s anyway: if a later version moved a
        // check behind the model load, the row says so instead of holding
        // the scene on a fetch.
        const rejection = async (options: TranscribeOptions) => {
          let timer: ReturnType<typeof setTimeout> | null = null;
          try {
            return await Promise.race([
              transcribe(options).then(
                () => "resolved",
                (e) => `rejects: ${e instanceof Error ? e.message : String(e)}`,
              ),
              new Promise<string>((resolve) => {
                timer = setTimeout(() => resolve("still pending after 1s: the checks passed and a model load started"), 1000);
              }),
            ]);
          } finally {
            if (timer !== null) clearTimeout(timer);
          }
        };
        rows.push({label: 'transcribe(small.en, language: "vi")', value: await rejection({channelWaveform: waveform, model: "small.en", language: "vi"})});
        rows.push({
          label: 'transcribe(large-v3-turbo, "vi", translate)',
          value: await rejection({channelWaveform: waveform, model: "large-v3-turbo", language: "vi", task: "translate"}),
        });
        rows.push({label: "transcribe(small), no language", value: await rejection({channelWaveform: waveform, model: "small"})});

        const support = await canUseWhisperWebGpu();
        if (!support.supported) {
          setStatus({state: "unsupported", reason: support.reason ?? "unknown", rows});
          continueRender(handle);
          return;
        }

        await clearStaleModels();
        rows.push({label: "isWhisperModelCached(small.en)", value: String(await isWhisperModelCached({model: "small.en"}))});

        try {
          const {alreadyLoaded} = await loadWhisperModel({model: "small.en"});
          rows.push({label: "loadWhisperModel(small.en)", value: `loaded · alreadyLoaded: ${alreadyLoaded}`});
          try {
            const transcription = await transcribe({channelWaveform: waveform, model: "small.en"});
            const {captions} = toCaptions({whisperWebGpuOutput: transcription});
            const text = transcription.text.normalize("NFC");
            rows.push({
              label: "transcribe(small.en) → toCaptions()",
              value: `"${text.length > 48 ? `${text.slice(0, 48)}…` : text}" · ${transcription.words.length} words → ${captions.length} captions`,
            });
          } catch (e) {
            rows.push({label: "transcribe(small.en)", value: `failed: ${e instanceof Error ? e.message : String(e)}`});
          }
          await removeWhisperModel({model: "small.en"});
          setStatus({state: "ready", rows});
        } catch (e) {
          await disposeWhisperModel({model: "small.en"});
          rows.push({label: "loadWhisperModel(small.en)", value: `failed: ${e instanceof Error ? e.message : String(e)}`});
          setStatus({state: "load-failed", rows});
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
      {status.state === "checking" ? null : (
        <div style={{marginTop: 18, width: 1180, display: "flex", flexDirection: "column", gap: 4}}>
          {status.rows.map((row) => (
            <div key={row.label} style={{display: "flex", gap: 14, fontFamily: "monospace", fontSize: 14, lineHeight: 1.35}}>
              <div style={{width: 400, flexShrink: 0, color: palette.textDim, textAlign: "right"}}>{row.label}</div>
              <div style={{color: palette.text, overflowWrap: "anywhere"}}>{row.value}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Speech to @remotion/captions, entirely client-side
      </div>
    </AbsoluteFill>
  );
};
