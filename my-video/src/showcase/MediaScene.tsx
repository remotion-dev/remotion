import {Gif, getGifDurationInSeconds, preloadGif} from "@remotion/gif";
import {MacOSCursor, macOSCursorNames, macOSCursorSchema, resolveCursor} from "@remotion/mac-cursors";
import {Video} from "@remotion/media";
import {preloadAudio, preloadFont, preloadImage, preloadVideo, resolveRedirect} from "@remotion/preload";
import {useEffect, useState} from "react";
import {AbsoluteFill, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

// Demonstrates: @remotion/media's <Video> (trimBefore + animated cropLeft/
// cropRight on real footage), @remotion/gif's <Gif> (also croppable per the
// cropping guide) plus its preloadGif()/getGifDurationInSeconds() helpers,
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
  const [handle] = useState(() => delayRender("preloading gif + reading its duration"));
  const [gifDuration, setGifDuration] = useState<number | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    const {waitUntilDone, free} = preloadGif(staticFile("sample-clip.gif"));
    (async () => {
      try {
        await waitUntilDone();
        setGifDuration(await getGifDurationInSeconds(staticFile("sample-clip.gif")));
        setResolvedUrl(await resolveRedirect(staticFile("sample-clip.mp4")));
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    })();
    return () => free();
  }, [handle]);

  useEffect(() => {
    const unpreload = [
      preloadVideo(staticFile("sample-clip.mp4")),
      preloadImage(staticFile("sample-frame.png")),
      preloadAudio(staticFile("sample-tone.wav")),
      preloadFont(staticFile("bangers.woff2")),
    ];
    return () => unpreload.forEach((free) => free());
  }, []);

  const crop = interpolate(frame, [15, 45], [0, 0.18], {
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
          <Video
            src={staticFile("sample-clip.mp4")}
            trimBefore={Math.round(0.3 * fps)}
            style={{width: 480, height: 270}}
            objectFit="cover"
            cropLeft={crop}
            cropRight={crop}
            muted
          />
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 10}}>
          <div style={{borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)"}}>
            <Gif src={staticFile("sample-clip.gif")} width={300} height={169} fit="cover" />
          </div>
          <div style={{color: palette.textDim, fontSize: 16, fontFamily: "monospace"}}>
            {gifDuration === null ? "measuring gif…" : `getGifDurationInSeconds(): ${gifDuration.toFixed(2)}s`}
          </div>
          <div style={{color: palette.textDim, fontSize: 14, fontFamily: "monospace"}}>
            {resolvedUrl === null ? "resolving redirect…" : `resolveRedirect(): …${resolvedUrl.slice(-24)}`}
          </div>
        </div>
      </div>
      <MacOSCursor
        cursor={cursorName}
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
