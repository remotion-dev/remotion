import {buildOpenInRemotionNewUrl, createElementPayload, isInsideStudio, setStudioDragData} from "@remotion/studio-protocol";
import {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Artifact,
  Experimental,
  Interactive,
  Sequence,
  VERSION,
  getInputProps,
  getRemotionEnvironment,
  getStaticFiles,
  interpolateColors,
  measureSpring,
  prefetch,
  staticFile,
  useBufferState,
  useCurrentFrame,
  useCurrentScale,
  usePixelDensity,
  useRemotionEnvironment,
  useVideoConfig,
  watchStaticFile,
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
// Also: getStaticFiles() lists public/ at runtime; watchStaticFile()
// subscribes to edits of one file but is a no-op (plus a console warning)
// anywhere except the Studio, so its change counter only moves there;
// useBufferState().delayPlayback() holds Studio/Player playback while the
// prefetch above is in flight (it's a deliberate no-op during a CLI render,
// so it can't stall one); Experimental.useIsPlayer() reports whether this
// tree is inside <Player>. getStaticFiles()/watchStaticFile() move to
// @remotion/studio in v5. Experimental.Clipper/Null are not used: both are
// removed-API stubs that unconditionally throw (see AGENTS.md).
//
// Interactive.withSchema() is intentionally not used here: it's a
// component-authoring API for building reusable Studio-integrated
// component libraries (in 4.0.527, @remotion/shapes, @remotion/gif,
// @remotion/media's <Audio>/<Video>, @remotion/mac-cursors,
// @remotion/rough-notation, @remotion/rive and @remotion/transitions'
// <TransitionSeries> are built with it; @remotion/skia isn't), not something
// a content scene like this one would reach for.
//
// The last row comes from inside a <Sequence width height>: useVideoConfig()
// there reports the Sequence's size, not the composition's. It needs its own
// component because the hook reads the Sequence's context.
const SequenceSizeRow: React.FC<{outsideSize: string}> = ({outsideSize}) => {
  const {width, height} = useVideoConfig();
  return (
    <div style={{color: palette.text, fontSize: 17, fontFamily: "monospace"}}>
      {`useVideoConfig() inside <Sequence width={640} height={360}>: ${width}x${height} (outside it: ${outsideSize})`}
    </div>
  );
};

export const CoreEnvironmentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps, id, defaultCodec, defaultOutName} = useVideoConfig();
  const scale = useCurrentScale({dontThrowIfOutsideOfRemotion: true});
  const pixelDensity = usePixelDensity({dontThrowIfOutsideOfRemotion: true});
  const environment = useRemotionEnvironment();
  const [inputProps] = useState(() => getInputProps());
  const [staticFiles] = useState(() => getStaticFiles());
  const [watchedChanges, setWatchedChanges] = useState(0);
  const [prefetchStatus, setPrefetchStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [progressEvents, setProgressEvents] = useState(0);
  const buffer = useBufferState();
  // @remotion/studio-protocol is how an element library hands a component to
  // the Studio. Packaging one and writing it into a drag's DataTransfer work
  // anywhere; installInStudio()/addElementLibraryToStudio() probe localhost for
  // a running Studio instead, so they run in scripts/renderer-apis.mjs.
  const [studioProtocol] = useState(() => {
    try {
      const payload = createElementPayload({
        displayName: "Pulse",
        slug: "pulse",
        sourceCode: "export const Pulse: React.FC = () => null;",
        dependencies: [],
        dimensions: null,
        durationInFrames: 60,
      });
      const dataTransfer = new DataTransfer();
      setStudioDragData({dataTransfer, payload});
      const url = new URL(buildOpenInRemotionNewUrl({payload}));
      // MIME parameters (";v=1;type=element;...") trimmed for display.
      const types = [...dataTransfer.types].map((type) => type.split(";")[0]);
      return [
        `studio-protocol: isInsideStudio() ${isInsideStudio()} · buildOpenInRemotionNewUrl() → ${url.host}`,
        `createElementPayload() → setStudioDragData(): ${types.join(", ")}`,
      ];
    } catch (err) {
      return [`studio-protocol failed: ${err instanceof Error ? err.message : String(err)}`];
    }
  });
  const isPlayer = Experimental.useIsPlayer();

  useEffect(() => {
    const playback = buffer.delayPlayback();
    const {free, waitUntilDone} = prefetch(staticFile("sample-clip.mp4"), {
      method: "blob-url",
      // Never fires in a CLI render: prefetch() resolves immediately there.
      onProgress: () => setProgressEvents((n) => n + 1),
    });
    let freed = false;
    // Playback must be released on failure too, or the Studio/Player sits
    // "buffering" forever. free() on unmount rejects with "free() called";
    // that one is expected, so only a real failure is reported.
    waitUntilDone()
      .then(() => setPrefetchStatus("ready"))
      .catch((err) => {
        if (freed) return;
        console.error("prefetch(sample-clip.mp4) failed", err);
        setPrefetchStatus("failed");
      })
      .finally(() => playback.unblock());
    return () => {
      freed = true;
      playback.unblock();
      free();
    };
  }, [buffer]);

  useEffect(() => {
    const {cancel} = watchStaticFile(staticFile("sample-clip.mp4"), () => setWatchedChanges((n) => n + 1));
    return cancel;
  }, []);

  const settleFrames = measureSpring({fps, config: {damping: 200}});
  // A looser threshold counts the spring as settled sooner.
  const looseSettleFrames = measureSpring({fps, config: {damping: 200}, threshold: 0.05});
  // Modern color syntaxes and a posterized (stepped) blend between them.
  const swatchColor = interpolateColors(frame, [0, 75], ["oklch(0.62 0.21 285)", "hsl(188, 85%, 53%)"], {posterize: 5});

  const rows = [
    `VERSION: ${VERSION}`,
    `useRemotionEnvironment(): isStudio=${String(environment.isStudio)}, isRendering=${String(environment.isRendering)}`,
    `getInputProps(): ${JSON.stringify(inputProps)}`,
    `useCurrentScale(): ${scale.toFixed(2)} · usePixelDensity(): ${pixelDensity.toFixed(2)}`,
    `measureSpring({damping: 200}) settles in ${settleFrames} frames (${looseSettleFrames} at threshold 0.05)`,
    `prefetch(sample-clip.mp4): ${prefetchStatus}, ${progressEvents} onProgress events · useBufferState(): playback ${prefetchStatus === "loading" ? "held" : "released"}`,
    `useVideoConfig(): id=${id}, defaultCodec=${defaultCodec}, defaultOutName=${defaultOutName}`,
    `getStaticFiles(): ${staticFiles.length} files in public/ (${staticFiles.slice(0, 2).map((f) => f.name).join(", ")}, …)`,
    `watchStaticFile(sample-clip.mp4): ${environment.isStudio ? `watching, ${watchedChanges} edits seen` : "no-op outside the Studio"}`,
    `Experimental.useIsPlayer(): ${String(isPlayer)}`,
    ...studioProtocol,
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
          <div key={row} style={{color: palette.text, fontSize: 17, fontFamily: "monospace"}}>
            {row}
          </div>
        ))}
        <Sequence width={640} height={360} layout="none">
          <SequenceSizeRow outsideSize={`${width}x${height}`} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
