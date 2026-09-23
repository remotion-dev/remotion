import {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Artifact,
  Interactive,
  VERSION,
  getInputProps,
  getRemotionEnvironment,
  interpolateColors,
  measureSpring,
  prefetch,
  staticFile,
  useCurrentFrame,
  useCurrentScale,
  usePixelDensity,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates core remotion's introspection/utility APIs that don't fit a
// visual scene of their own: VERSION, getRemotionEnvironment() (the plain
// function) alongside useRemotionEnvironment() (the hook the docs recommend
// instead), getInputProps(), useCurrentScale(), usePixelDensity(),
// measureSpring() (how long a spring takes to settle, without animating
// one), interpolateColors() (the swatch's background), prefetch() (kept for
// its whole lifecycle: called, awaited, freed) and <Artifact> (emits a JSON
// file alongside the video on frame 0). Interactive.Div/Span wrap the
// heading purely to exercise that API — see interactive.mdx.
//
// Interactive.withSchema() is intentionally not used here: it's a
// component-authoring API for building reusable Studio-integrated
// component libraries (see @remotion/skia's SkiaCanvas-style components),
// not something a content scene like this one would reach for.
export const CoreEnvironmentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const scale = useCurrentScale({dontThrowIfOutsideOfRemotion: true});
  const pixelDensity = usePixelDensity({dontThrowIfOutsideOfRemotion: true});
  const environment = useRemotionEnvironment();
  const [inputProps] = useState(() => getInputProps());
  const [prefetchStatus, setPrefetchStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const {free, waitUntilDone} = prefetch(staticFile("sample-clip.mp4"), {method: "blob-url"});
    waitUntilDone().then(() => setPrefetchStatus("ready"));
    return () => free();
  }, []);

  const settleFrames = measureSpring({fps, config: {damping: 200}});
  const swatchColor = interpolateColors(frame, [0, 75], [palette.accent, palette.accent2]);

  const rows = [
    `VERSION: ${VERSION}`,
    `useRemotionEnvironment(): isStudio=${String(environment.isStudio)}, isRendering=${String(environment.isRendering)}`,
    `getInputProps(): ${JSON.stringify(inputProps)}`,
    `useCurrentScale(): ${scale.toFixed(2)} · usePixelDensity(): ${pixelDensity.toFixed(2)}`,
    `measureSpring({damping: 200}) settles in ${settleFrames} frames`,
    `prefetch(sample-clip.mp4): ${prefetchStatus}`,
  ];

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center", alignItems: "center"}}>
      <Interactive.Div name="Container" style={{position: "absolute", top: 64, width, textAlign: "center"}}>
        <Interactive.Span style={{color: palette.textDim, fontSize: 26}}>
          core remotion · environment &amp; introspection APIs
        </Interactive.Span>
      </Interactive.Div>
      {getRemotionEnvironment().isRendering && frame === 0 ? (
        <Artifact filename="core-api-scene-env.json" content={JSON.stringify({version: VERSION, ...environment}, null, 2)} />
      ) : null}
      <div style={{width: 48, height: 48, borderRadius: 12, background: swatchColor, marginBottom: 24}} />
      <div style={{display: "flex", flexDirection: "column", gap: 10, alignItems: "center"}}>
        {rows.map((row) => (
          <div key={row} style={{color: palette.text, fontSize: 20, fontFamily: "monospace"}}>
            {row}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
