import {canUseWhisperWebGpu, loadWhisperModel} from "@remotion/whisper-webgpu";
import {useEffect, useState} from "react";
import {AbsoluteFill, cancelRender, continueRender, delayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Status =
  | {state: "checking"}
  | {state: "unsupported"; reason: string}
  | {state: "ready"}
  | {state: "load-failed"};

// Demonstrates: @remotion/whisper-webgpu — transcribing audio locally in
// the browser over WebGPU (Transformers.js), no server round-trip and no
// API key, converting straight to @remotion/captions' Caption[] format via
// toCaptions(). See browser-transcription.md. Like the video-matting
// scene, the model download from remotion.media can fail for real users
// too (network, an unsupported browser), so this checks support and
// handles a failed load gracefully rather than assuming success.
export const BrowserTranscriptionScene: React.FC = () => {
  const {width} = useVideoConfig();
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

        try {
          await loadWhisperModel({model: "small.en"});
          setStatus({state: "ready"});
        } catch {
          setStatus({state: "load-failed"});
        }
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    })();
  }, [handle]);

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
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Speech to @remotion/captions, entirely client-side
      </div>
    </AbsoluteFill>
  );
};
