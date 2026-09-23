import {Gif, getGifDurationInSeconds, preloadGif} from "@remotion/gif";
import {MacOSCursor, macOSCursorNames, macOSCursorSchema, resolveCursor} from "@remotion/mac-cursors";
import {grayscale} from "@remotion/effects/grayscale";
import {hue} from "@remotion/effects/hue";
import {Video} from "@remotion/media";
import {preloadAudio, preloadFont, preloadImage, preloadVideo, resolveRedirect} from "@remotion/preload";
import {useEffect, useState} from "react";
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useDelayRender, useRemotionEnvironment, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/media's <Video> (trimBefore + animated cropLeft/
// cropRight + a 2D effects chain on real footage), @remotion/gif's <Gif>
// (pre-rolled with a negative <Sequence from>) plus its
// preloadGif()/getGifDurationInSeconds() helpers,
// @remotion/preload's asset-warming functions (each returns an unregister
// callback, unlike preloadGif's waitUntilDone()/free() pair) plus
// resolveRedirect(), and @remotion/mac-cursors overlaid to suggest a UI
// interaction -- including its internals, resolveCursor() (the same lookup
// <MacOSCursor> uses) and macOSCursorSchema (its Studio-parameter schema,
// usable standalone for validation). sample-clip.mp4/.gif are locally
// rendered stand-ins for real footage — see scripts/generate-sample-media.mjs.
export const MediaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("preloading gif + reading its duration"));
  const [gifDuration, setGifDuration] = useState<number | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [gifInfo, setGifInfo] = useState<string | null>(null);

  useEffect(() => {
    const {waitUntilDone, free} = preloadGif(staticFile("sample-clip.gif"));
    (async () => {
      try {
        await waitUntilDone();
        setGifDuration(await getGifDurationInSeconds(staticFile("sample-clip.gif")));
        setResolvedUrl(await resolveRedirect(staticFile("sample-clip.webm")));
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    })();
    return () => free();
  }, [handle, continueRender, cancelRender]);

  const {isRendering} = useRemotionEnvironment();
  useEffect(() => {
    // Preloading warms the browser cache for Studio/Player playback; a render
    // seeks frame by frame and gains nothing from it. It isn't harmless here
    // either: preloadVideo() leaves a hidden <video preload="auto"> in the
    // page, and with a clip this Chromium can decode, every canvas-based
    // component in the scene (<Gif>, <Video>) rendered blank. See AGENTS.md.
    if (isRendering) {
      return;
    }
    const unpreload = [
      preloadVideo(staticFile("sample-clip.webm")),
      preloadImage(staticFile("sample-frame.png")),
      preloadAudio(staticFile("sample-tone.wav")),
      preloadFont(staticFile("bangers.woff2")),
    ];
    return () => unpreload.forEach((free) => free());
  }, [isRendering]);

  const crop = interpolate(frame, [15, 45], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // The footage starts gray and gains its color while the crop closes in.
  const desaturate = interpolate(frame, [15, 45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorX = interpolate(frame, [0, 40], [900, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [0, 40], [560, 330], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorName = frame > 42 ? "pointer" : "default";
  // cursor="custom" + customCursor is the Studio's free-text escape hatch: the
  // name goes through the same resolveCursor() lookup as the enum values.
  const useCustomCursor = frame > 58;
  // resolveCursor() is the same lookup <MacOSCursor> uses internally to turn
  // a CSS cursor name into an actual asset; macOSCursorSchema is the same
  // component's Studio-parameter schema (an InteractivitySchema, not a zod
  // schema) -- its "cursor" field's enum variants are every valid name
  // plus a "custom" option, one more than macOSCursorNames alone.
  const resolvedCursor = resolveCursor(cursorName);
  const cursorField = macOSCursorSchema.cursor;
  const variantCount = cursorField && cursorField.type === "enum" ? Object.keys(cursorField.variants).length : 0;

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26, zIndex: 2}}>
        @remotion/media · @remotion/gif · @remotion/preload · @remotion/mac-cursors
      </div>
      <div style={{position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 40}}>
        <div style={{borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"}}>
          {/* The VP9 .webm, not the H.264 .mp4: this environment's Chromium can't
              decode H.264 through WebCodecs, so given the .mp4 <Video> quietly
              falls back to <OffthreadVideo> (a warning in the main tab only).
              disallowFallbackToOffthreadVideo turns that into a render error. */}
          <Video
            src={staticFile("sample-clip.webm")}
            disallowFallbackToOffthreadVideo
            trimBefore={Math.round(0.3 * fps)}
            // trimAfter ends the window at 2.4s; at 1.5x that 63-frame window
            // plays in 42 frames, and loop restarts it within the scene.
            trimAfter={Math.round(2.4 * fps)}
            playbackRate={1.5}
            loop
            style={{width: 480, height: 270}}
            objectFit="cover"
            cropLeft={crop}
            cropRight={crop}
            // Only 2D-backend effects here: they draw on plain 2D canvases and
            // take no WebGL context. This scene is mounted together with
            // EffectsCatalogScene (12 WebGL contexts) during the transition
            // between them, and Chrome keeps only 16 (see AGENTS.md).
            effects={[hue({degrees: frame * 2}), grayscale({amount: desaturate})]}
            muted
          />
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10}}>
          <div style={{borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"}}>
            {/* A negative from pre-rolls the gif: at the scene's first frame
                it's already 12 frames in. */}
            <Sequence from={-12} layout="none">
              <Gif
                src={staticFile("sample-clip.gif")}
                width={300}
                height={169}
                fit="cover"
                playbackRate={0.75}
                loopBehavior="loop"
                onLoad={(info) => setGifInfo(`${info.width}x${info.height}, ${info.frames.length} frames`)}
              />
            </Sequence>
          </div>
          <div style={{color: palette.textDim, fontSize: 16, fontFamily: "monospace"}}>
            {gifDuration === null ? "measuring gif…" : `getGifDurationInSeconds(): ${gifDuration.toFixed(2)}s`}
            {gifInfo === null ? "" : ` · onLoad: ${gifInfo}`}
          </div>
          <div style={{color: palette.textDim, fontSize: 14, fontFamily: "monospace"}}>
            {resolvedUrl === null ? "resolving redirect…" : `resolveRedirect(): …${resolvedUrl.slice(-24)}`}
          </div>
        </div>
      </div>
      <MacOSCursor
        cursor={useCustomCursor ? "custom" : cursorName}
        customCursor="grabbing"
        style={{position: "absolute", left: cursorX, top: cursorY, zIndex: 3}}
      />
      <div style={{position: "absolute", top: 100, width, textAlign: "center", color: palette.textDim, fontSize: 14, fontFamily: "monospace"}}>
        resolveCursor("{cursorName}"): {resolvedCursor?.width}x{resolvedCursor?.height} hotspot ({resolvedCursor?.hotspot.x}, {resolvedCursor?.hotspot.y}) ·{" "}
        {macOSCursorNames.length} cursor names · macOSCursorSchema variants: {variantCount}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width,
          textAlign: "center",
          color: palette.text,
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        Real footage, cropped and trimmed — not just vector shapes
      </div>
    </AbsoluteFill>
  );
};
