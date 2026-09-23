import {AbsoluteFill, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates the @remotion/rive API surface (<RemotionRiveCanvas>) --
// without actually rendering it. Its Rive WASM runtime is fetched from a
// hardcoded unpkg.com URL baked into the package itself (not the `src`
// prop, and not configurable), so it fails here for ANY .riv file, same
// root cause as this project's video-matting/whisper-webgpu network
// limitations. Unlike those, this isn't a clean, catchable failure: tested
// for real (<RemotionRiveCanvas src="https://cdn.rive.app/animations/
// vehicles.riv" />, the exact sample URL from @remotion/rive's own docs,
// wrapped in a React error boundary), the component never calls
// continueRender()/cancelRender() in its fetch-failure branch -- it only
// sets local error state -- so the delayRender() handle from its mount
// effect is left dangling. A real render attempt pinned the renderer in a
// re-render loop for 90+ seconds with no sign of resolving on its own. An
// error boundary (the same idea that failed for ThreeWebGPUCanvas in
// ThreeScene) catches the re-thrown error but can't release that dangling
// handle, so it doesn't fix the hang -- confirmed by testing, not assumed.
// This is a real gap in this environment (arguably an edge case in
// @remotion/rive's own error handling too), not a choice to skip the API --
// see docs/findings.md.
export const RiveScene: React.FC = () => {
  const {width} = useVideoConfig();

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/rive · vector animations, frame-accurate
      </div>
      <div style={{fontSize: 30, fontWeight: 600, color: palette.text, textAlign: "center", maxWidth: 900, padding: "0 40px"}}>
        Rive's WASM runtime needs network access this sandbox blocks — shown without a live attempt
      </div>
      <div style={{fontSize: 16, color: palette.textDim, marginTop: 16, fontFamily: "monospace", textAlign: "center", maxWidth: 820}}>
        {'<RemotionRiveCanvas src="https://cdn.rive.app/animations/vehicles.riv" />'}
      </div>
      <div style={{position: "absolute", bottom: 56, width, textAlign: "center", color: palette.textDim, fontSize: 22}}>
        Import a Rive (rive.app) animation, driven by Remotion's own clock
      </div>
    </AbsoluteFill>
  );
};
