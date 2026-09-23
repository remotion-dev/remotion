import {
  AbsoluteFill,
  AnimatedImage,
  CanvasImage,
  HtmlInCanvas,
  IFrame,
  Img,
  OffthreadVideo,
  staticFile,
  useVideoConfig,
} from "remotion";
import {sepiaEffect} from "./effects/sepia-effect";
import {palette} from "./palette";
import {poppins} from "./font";

const TILE = 220;

const IFRAME_CONTENT = `<!doctype html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#111827;color:#f8fafc;font-family:sans-serif;font-size:20px;">Local &lt;IFrame&gt;</body></html>`;

const Tile: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
    <div style={{width: TILE, height: TILE, overflow: "hidden", borderRadius: 8, background: "#000"}}>{children}</div>
    <div style={{color: palette.textDim, fontSize: 16, fontFamily: "monospace"}}>{label}</div>
  </div>
);

// Demonstrates six core remotion media/canvas components in a grid:
// <Img> (a plain <img>, sample-frame.png — a static PNG, not the animated
// gif, since Remotion's own eslint-plugin correctly flags <Img> on an
// animated GIF and points at <AnimatedImage>/<Gif> instead), <OffthreadVideo>
// (called directly here, not just via @remotion/animated-emoji's internals),
// <AnimatedImage> (sample-clip.gif, frame-accurate via ImageDecoder, synced
// to useCurrentFrame() rather than looping on its own like a plain <img>
// would), <CanvasImage> with a custom createEffect() filter
// (sepia-effect.ts) applied, and <IFrame> pointed at a local data: URL so
// it needs no network. <HtmlInCanvas> is checked with
// HtmlInCanvas.isSupported() rather than assumed — it needs Chrome 149+
// with a flag enabled, which this sandbox's headless Chromium predates.
//
// <Html5Video> (the native <video> element Remotion synchronizes, distinct
// from @remotion/media's newer WebCodecs-based <Video>) is deliberately not
// rendered here. Testing it in this sandbox surfaced two separate native
// decode hangs — Html5Video's own internal delayRender() calls for
// "loading duration" and, on a full multi-frame render, for "seeking to a
// later frame's time" — neither of which reaches onError() or
// onLoadedMetadata(), non-deterministically, so no component-level
// try/catch or timeout can reliably recover from it without risking an
// aborted render. See media-playback-error.mdx's "Too many video tags" and
// general troubleshooting notes; the fix the docs suggest for a broken
// Html5Video is exactly @remotion/media's <Video>, already used in
// MediaScene.
export const CoreMediaScene: React.FC = () => {
  const {width} = useVideoConfig();
  const htmlInCanvasSupported = HtmlInCanvas.isSupported();

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, flexDirection: "column", alignItems: "center", paddingTop: 48}}>
      <div style={{width, textAlign: "center", color: palette.textDim, fontSize: 24, marginBottom: 24}}>
        core remotion · media &amp; canvas components
      </div>
      <div style={{display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 1150}}>
        <Tile label="<Img>">
          <Img src={staticFile("sample-frame.png")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </Tile>
        <Tile label="<OffthreadVideo>">
          <OffthreadVideo src={staticFile("sample-clip.mp4")} style={{width: "100%", height: "100%", objectFit: "cover"}} muted />
        </Tile>
        <Tile label="<AnimatedImage>">
          <AnimatedImage src={staticFile("sample-clip.gif")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        </Tile>
        <Tile label="<Html5Video> (native decode unreliable here)">
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.textDim,
              fontSize: 16,
              textAlign: "center",
              padding: 12,
            }}
          >
            See MediaScene's &lt;Video&gt; instead
          </div>
        </Tile>
        <Tile label="<CanvasImage> + createEffect()">
          <CanvasImage src={staticFile("sample-clip.gif")} width={TILE} height={TILE} fit="cover" effects={[sepiaEffect({amount: 1})]} />
        </Tile>
        <Tile label="<IFrame> (local data: URL)">
          <IFrame src={`data:text/html,${encodeURIComponent(IFRAME_CONTENT)}`} style={{width: "100%", height: "100%", border: "none"}} />
        </Tile>
        <Tile label={`<HtmlInCanvas> (${htmlInCanvasSupported ? "supported" : "needs Chrome 149+"})`}>
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
                fontSize: 16,
                textAlign: "center",
                padding: 12,
              }}
            >
              Falls back gracefully
            </div>
          )}
        </Tile>
      </div>
    </AbsoluteFill>
  );
};
