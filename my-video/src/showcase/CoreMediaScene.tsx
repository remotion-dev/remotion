import {blur} from "@remotion/effects/blur";
import {
  AbsoluteFill,
  AnimatedImage,
  CanvasImage,
  HTML_IN_CANVAS_UNSUPPORTED_MESSAGE,
  HtmlInCanvas,
  IFrame,
  Img,
  OffthreadVideo,
  isHtmlInCanvasSupported,
  staticFile,
  useVideoConfig,
} from "remotion";
import {useState} from "react";
import {sepiaEffect} from "./effects/sepia-effect";
import {palette} from "./palette";
import {poppins} from "./font";

const TILE = 220;

const IFRAME_CONTENT = `<!doctype html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#111827;color:#f8fafc;font-family:sans-serif;font-size:20px;">Local &lt;IFrame&gt;</body></html>`;

const Tile: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
    <div style={{width: TILE, height: TILE, overflow: "hidden", borderRadius: 8, background: "#000"}}>{children}</div>
    {/* Fixed width so a long label wraps instead of widening the column (5 tiles per row). */}
    <div style={{width: TILE, color: palette.textDim, fontSize: 14, fontFamily: "monospace", textAlign: "center"}}>{label}</div>
  </div>
);

// A deliberately missing file: <Img> retries maxRetries times, then calls
// onImageError. That callback must unmount the <Img> (here: swap in a
// fallback) -- its load delayRender() is only released on unmount, so an
// onImageError that leaves the <Img> mounted times the render out after 28s
// (confirmed with a real render; see docs/findings.md).
const ImgFallbackTile: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  if (error !== null) {
    return (
      <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: palette.textDim, fontSize: 13, textAlign: "center", padding: 12}}>
        onImageError: {error.replace(/^.*\//, "missing ")}
      </div>
    );
  }
  return <Img src={staticFile("missing-on-purpose.png")} maxRetries={0} onImageError={(e) => setError(e.message)} />;
};

// Demonstrates core remotion's media/canvas components in a grid:
// <Img> (a plain <img>, sample-frame.png — a static PNG, not the animated
// gif, since Remotion's own eslint-plugin correctly flags <Img> on an
// animated GIF and points at <AnimatedImage>/<Gif> instead), <OffthreadVideo>
// (called directly here, not just via @remotion/animated-emoji's internals),
// <AnimatedImage> (sample-clip.gif, frame-accurate via ImageDecoder, synced
// to useCurrentFrame() rather than looping on its own like a plain <img>
// would), <CanvasImage> with a custom createEffect() filter
// (sepia-effect.ts) applied to sample-frame.png (not the gif: <CanvasImage>
// loads through new Image() and draws it once, so a gif shows only its
// first frame), and <IFrame> pointed at a local data: URL so it needs no
// network.
//
// <Img effects> renders through <CanvasImage> instead of a native <img>.
// blur() is a WebGL2 effect, so that tile holds 2 WebGL contexts; this
// scene's neighbors in FullReel (GsapScene, MediaToolsScene) hold none, so
// that stays well inside Chrome's 16 (see docs/findings.md). Given a missing file,
// <CanvasImage maxRetries onError> releases its own delayRender() when it
// calls onError, so unlike <Img onImageError> it can stay mounted.
//
// <HtmlInCanvas> is checked with the standalone
// isHtmlInCanvasSupported() (the same function as HtmlInCanvas.isSupported())
// rather than assumed — it needs a recent Chrome with a flag enabled, which
// this sandbox's headless Chromium 141 predates. When it's unsupported the
// tile shows HTML_IN_CANVAS_UNSUPPORTED_MESSAGE, the exact text <HtmlInCanvas>
// would cancel the render with. In the installed 4.0.527 that message says
// Chrome 148 while the docs say 149; this fork's packages/core now says 149.
//
// <Html5Video> (the native <video> element Remotion synchronizes, distinct
// from @remotion/media's WebCodecs-based <Video>) isn't a tile here: in this
// headless Chromium a decodable <video> in the frame blanks canvas-based
// components beside it (<AnimatedImage> and <CanvasImage> came out white),
// the same thing preloadVideo() did in MediaScene. It plays behind the
// captions in CaptionsScene instead, which has no canvases. See docs/findings.md.
export const CoreMediaScene: React.FC = () => {
  const {width} = useVideoConfig();
  const htmlInCanvasSupported = isHtmlInCanvasSupported();
  // The state setter doubles as onError: it's stable, so it doesn't restart
  // <CanvasImage>'s load effect (onError is one of its dependencies).
  const [canvasImageError, setCanvasImageError] = useState<Error | null>(null);

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, flexDirection: "column", alignItems: "center", paddingTop: 48}}>
      <div style={{width, textAlign: "center", color: palette.textDim, fontSize: 24, marginBottom: 24}}>
        core remotion · media &amp; canvas components
      </div>
      <div style={{display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 1180}}>
        <Tile label="<Img>">
          <Img src={staticFile("sample-frame.png")} style={{width: "100%", height: "100%", objectFit: "cover"}} pauseWhenLoading delayRenderTimeoutInMilliseconds={15000} delayRenderRetries={1} cropTop={0.1} cropBottom={0.1} />
        </Tile>
        <Tile label="<Img effects={[blur({radius: 8})]}>">
          {/* With effects, width/height must be numbers and style.objectFit becomes <CanvasImage>'s fit. */}
          <Img src={staticFile("sample-frame.png")} width={TILE} height={TILE} style={{objectFit: "cover"}} effects={[blur({radius: 8})]} />
        </Tile>
        <Tile label="<OffthreadVideo playbackRate={1.2}>">
          <OffthreadVideo src={staticFile("sample-clip.mp4")} style={{width: "100%", height: "100%", objectFit: "cover"}} muted playbackRate={1.2} />
        </Tile>
        <Tile label="<AnimatedImage fit=contain, 0.5x>">
          <AnimatedImage src={staticFile("sample-clip.gif")} width={TILE} height={TILE} fit="contain" playbackRate={0.5} loopBehavior="loop" cropLeft={0.1} cropRight={0.1} />
        </Tile>
        <Tile label="<Html5Video> (see CaptionsScene)">
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.textDim,
              fontSize: 15,
              textAlign: "center",
              padding: 12,
            }}
          >
            A decodable &lt;video&gt; here blanks the canvas tiles, so it plays behind the captions scene instead
          </div>
        </Tile>
        <Tile label="<Img maxRetries onImageError>">
          <ImgFallbackTile />
        </Tile>
        <Tile label="<CanvasImage> + createEffect()">
          <CanvasImage src={staticFile("sample-frame.png")} width={TILE} height={TILE} fit="cover" effects={[sepiaEffect({amount: 1})]} className="sepia-tile" id="sepia-canvas" crossOrigin="anonymous" pauseWhenLoading delayRenderTimeoutInMilliseconds={15000} delayRenderRetries={1} cropTop={0.15} />
        </Tile>
        <Tile label="<CanvasImage maxRetries onError>">
          <div style={{position: "relative", width: "100%", height: "100%"}}>
            <CanvasImage src={staticFile("missing-on-purpose.png")} width={TILE} height={TILE} maxRetries={0} onError={setCanvasImageError} />
            {canvasImageError === null ? null : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: palette.textDim,
                  fontSize: 13,
                  textAlign: "center",
                  padding: 12,
                }}
              >
                onError: {canvasImageError.message.replace(/"[^"]*\//, '"…/')}
              </div>
            )}
          </div>
        </Tile>
        <Tile label="<IFrame> (local data: URL)">
          <IFrame src={`data:text/html,${encodeURIComponent(IFRAME_CONTENT)}`} style={{width: "100%", height: "100%", border: "none"}} delayRenderTimeoutInMilliseconds={15000} delayRenderRetries={1} />
        </Tile>
        <Tile label={`<HtmlInCanvas> (${htmlInCanvasSupported ? "supported" : "unsupported here"})`}>
          {htmlInCanvasSupported ? (
            <HtmlInCanvas width={TILE} height={TILE}>
              <div style={{fontSize: 24, color: palette.text, display: "flex", alignItems: "center", justifyContent: "center", height: "100%"}}>
                Hello
              </div>
            </HtmlInCanvas>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: palette.textDim,
                fontSize: 11,
                lineHeight: 1.35,
                textAlign: "center",
                padding: 12,
              }}
            >
              {HTML_IN_CANVAS_UNSUPPORTED_MESSAGE}
            </div>
          )}
        </Tile>
      </div>
    </AbsoluteFill>
  );
};
