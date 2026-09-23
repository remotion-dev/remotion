import {
  canUseVideoMatting,
  disposeVideoMattingModel,
  getAvailableModels,
  isVideoMattingModelCached,
  loadVideoMattingModel,
  removeVideoMattingModel,
  separateVideoLayers,
} from "@remotion/video-matting";
import {useEffect, useState} from "react";
import {AbsoluteFill, staticFile, useDelayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Status =
  | {state: "checking"}
  | {state: "unsupported"; reason: string}
  | {state: "ready"; sizeMb: number; extra: string}
  | {state: "load-failed"; extra: string};

// Demonstrates: @remotion/video-matting — real AI background removal (not
// chroma-key), running a segmentation model locally over WebGPU. This is a
// preprocessing step (separateVideoLayers() produces a base + foreground
// WebM you save and then play back with <Video> like any other footage),
// so a per-frame-rendered scene's job is the capability check + model load
// shown here — see video-matting.md. Model files download from
// remotion.media on first use; that download can fail (blocked network,
// no WebGPU, an older browser), so a production UI must handle failure
// gracefully rather than assume success — which is exactly what this
// scene does, not a compromise for this environment. Beyond the load
// itself, this also exercises isVideoMattingModelCached() (cache lookup,
// no network needed), a real separateVideoLayers() attempt on
// sample-clip.mp4 (expected to fail here since no model loaded), and
// removeVideoMattingModel()/disposeVideoMattingModel() cleanup — all
// called regardless of whether the load itself succeeded.
export const VideoMattingScene: React.FC = () => {
  const {width} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("checking video matting support", {timeoutInMilliseconds: 20000}));
  const [status, setStatus] = useState<Status>({state: "checking"});

  useEffect(() => {
    (async () => {
      try {
        const support = await canUseVideoMatting({model: "modnet"});
        if (!support.supported) {
          setStatus({state: "unsupported", reason: support.reason ?? "unknown"});
          continueRender(handle);
          return;
        }

        const {webGpuDownloadSize} = getAvailableModels().find((m) => m.name === "modnet")!;
        const cachedBeforeLoad = await isVideoMattingModelCached({model: "modnet"});

        let extra = `cached before load: ${cachedBeforeLoad}`;
        try {
          await loadVideoMattingModel({model: "modnet"});
          try {
            await separateVideoLayers({model: "modnet", src: staticFile("sample-clip.mp4")});
            extra += ", separateVideoLayers: succeeded";
          } catch {
            extra += ", separateVideoLayers: failed";
          }
          await removeVideoMattingModel({model: "modnet"});
          setStatus({state: "ready", sizeMb: webGpuDownloadSize / 1024 / 1024, extra});
        } catch (e) {
          await disposeVideoMattingModel({model: "modnet"});
          setStatus({state: "load-failed", extra: `${extra}, load: ${e instanceof Error ? e.message : String(e)}`});
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
        return `Model ready (modnet, ${status.sizeMb.toFixed(1)}MB) — background removed, no green screen needed`;
      case "load-failed":
        return "WebGPU supported, model download failed — falls back gracefully";
    }
  })();

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/video-matting · AI background removal (WebGPU)
      </div>
      <div style={{fontSize: 30, fontWeight: 600, color: palette.text, textAlign: "center", maxWidth: 1000, padding: "0 40px"}}>
        {line}
      </div>
      {status.state === "ready" || status.state === "load-failed" ? (
        <div style={{fontSize: 16, color: palette.textDim, marginTop: 16, fontFamily: "monospace"}}>{status.extra}</div>
      ) : null}
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Cuts out the subject from any footage, not just a green screen
      </div>
    </AbsoluteFill>
  );
};
