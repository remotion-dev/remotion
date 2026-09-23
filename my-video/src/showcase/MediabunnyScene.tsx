import {Audio, Video} from "@remotion/media";
import {
  ALL_FORMATS,
  BufferSource,
  BufferTarget,
  CanvasSink,
  Conversion,
  ConversionCanceledError,
  Input,
  MkvOutputFormat,
  Mp4OutputFormat,
  Output,
  QUALITY_LOW,
  UrlSource,
  WebMOutputFormat,
  canDecode,
  canEncodeAudio,
  getDecodableAudioCodecs,
  getDecodableVideoCodecs,
  getEncodableAudioCodecs,
  getEncodableVideoCodecs,
  getFirstEncodableVideoCodec,
} from "mediabunny";
import {useEffect, useState} from "react";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useDelayRender} from "remotion";
import {poppins} from "./font";
import {attempt, type Row} from "./MediaToolsScene";
import {palette} from "./palette";

// Every sample file in public/, checked the way @remotion/media checks it
// before playing: if Mediabunny can decode all of a file's tracks here,
// <Video>/<Audio> decode it themselves; otherwise they fall back.
const FILES = [
  "sample-clip.webm",
  "sample-clip-tone.webm",
  "star-struck-0.5x.webm",
  "sample-tone.wav",
  "sample-clip.mp4",
  "star-struck-0.5x.mp4",
  "sample-tone.m4a",
];

const open = (file: string) => new Input({source: new UrlSource(staticFile(file)), formats: ALL_FORMATS});

// A CanvasSink hands back an HTMLCanvasElement, or an OffscreenCanvas where
// the DOM isn't available; either becomes an <Img> source.
const toUrl = async (canvas: HTMLCanvasElement | OffscreenCanvas) =>
  canvas instanceof HTMLCanvasElement ? canvas.toDataURL() : URL.createObjectURL(await canvas.convertToBlob());

// Mediabunny (https://mediabunny.dev/api/), the library under @remotion/media's
// <Audio> and <Video>, called directly and run for real in the render browser:
//
// - "Supported media": Input + UrlSource + ALL_FORMATS read each sample's
//   container, codecs, size, frame rate, bitrate (computePacketStats()) and
//   duration, and canDecode() on each track says whether <Video>/<Audio>
//   can decode it on this machine.
// - The codec catalog: getDecodable*/getEncodable*Codecs(), canDecode(),
//   canEncodeAudio() and getFirstEncodableVideoCodec().
// - Track details: getColorSpace(), hasHighDynamicRange(), canBeTransparent(),
//   getFirstTimestamp(), getMetadataTags(), getMimeType().
// - CanvasSink: canvasesAtTimestamps() for the thumbnails, getCanvas() with
//   alpha for the emoji frame.
// - Conversion: a trimmed, resized re-encode to MP4 read back through
//   BufferSource; an H.264 remux to MKV that copies packets without decoding;
//   the same file to WebM, which needs a decode this Chromium can't do, so the
//   tracks are discarded; and cancel() with ConversionCanceledError.
//
// The tiles on the right play samples through @remotion/media: the VP9 +
// Opus clip decodes here, while the H.264 clip and the AAC tone fall back.
export const MediabunnyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {delayRender, continueRender} = useDelayRender();
  const [handle] = useState(() => delayRender("Running Mediabunny experiments", {timeoutInMilliseconds: 120000}));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: Row[] = [];
      const thumbs: string[] = [];
      const add = async (label: string, fn: () => Promise<string>) => {
        results.push(await attempt(label, fn));
      };

      for (const file of FILES) {
        await add(file, async () => {
          const input = open(file);
          try {
            const format = await input.getFormat();
            const duration = await input.computeDuration();
            const video = await input.getPrimaryVideoTrack();
            const audio = await input.getPrimaryAudioTrack();
            const parts = [format.name];
            let decodes = true;
            if (video) {
              const stats = await video.computePacketStats(90);
              const ok = await video.canDecode();
              decodes &&= ok;
              parts.push(
                `${video.codec} ${video.displayWidth}×${video.displayHeight} ${Math.round(stats.averagePacketRate)}fps ${Math.round(stats.averageBitrate / 1000)}kbps ${ok ? "decodes" : "can't decode"}`,
              );
            }
            if (audio) {
              const ok = await audio.canDecode();
              decodes &&= ok;
              parts.push(`${audio.codec} ${audio.sampleRate / 1000}kHz ${audio.numberOfChannels}ch ${ok ? "decodes" : "can't decode"}`);
            }
            parts.push(`${duration.toFixed(2)}s`);
            parts.push(decodes ? "→ Mediabunny plays it" : video ? "→ falls back to <OffthreadVideo>" : "→ falls back to <Html5Audio>");
            return parts.join(" · ");
          } finally {
            input.dispose();
          }
        });
      }

      await add("getDecodable/EncodableVideoCodecs()", async () => {
        return `decode: ${(await getDecodableVideoCodecs()).join(", ")} · encode: ${(await getEncodableVideoCodecs()).join(", ")}`;
      });
      await add("getDecodable/EncodableAudioCodecs()", async () => {
        // Most of the list is PCM variants; they're counted, not listed.
        const short = (codecs: string[]) => {
          const pcm = codecs.filter((c) => c.startsWith("pcm-")).length;
          return [...codecs.filter((c) => !c.startsWith("pcm-")), `${pcm} PCM`].join(", ");
        };
        return `decode: ${short(await getDecodableAudioCodecs())} · encode: ${short(await getEncodableAudioCodecs())}`;
      });
      await add("canDecode · canEncodeAudio · getFirst…", async () => {
        return `canDecode("avc") ${await canDecode("avc")} · canDecode("vp9") ${await canDecode("vp9")} · canEncodeAudio("opus") ${await canEncodeAudio("opus")} · getFirstEncodableVideoCodec(["avc", "hevc", "vp9"]) ${await getFirstEncodableVideoCodec(["avc", "hevc", "vp9"])}`;
      });
      await add("star-struck .webm track details", async () => {
        const input = open("star-struck-0.5x.webm");
        try {
          const video = await input.getPrimaryVideoTrack();
          if (!video) throw new Error("no video track");
          const colorSpace = await video.getColorSpace();
          const tags = await input.getMetadataTags();
          return `${await input.getMimeType()} · canBeTransparent ${await video.canBeTransparent()} · HDR ${await video.hasHighDynamicRange()} · ${colorSpace.primaries ?? "unset"} primaries · starts at ${await input.getFirstTimestamp()}s · ${Object.keys(tags).length} metadata tags`;
        } finally {
          input.dispose();
        }
      });

      await add("CanvasSink thumbnails and emoji frame", async () => {
        const clip = open("sample-clip.webm");
        const emoji = open("star-struck-0.5x.webm");
        try {
          const clipTrack = await clip.getPrimaryVideoTrack();
          const emojiTrack = await emoji.getPrimaryVideoTrack();
          if (!clipTrack || !emojiTrack) throw new Error("no video track");
          const sink = new CanvasSink(clipTrack, {width: 160, height: 90, fit: "cover"});
          for await (const wrapped of sink.canvasesAtTimestamps([0.2, 1, 1.8, 2.6])) {
            if (wrapped) thumbs.push(await toUrl(wrapped.canvas));
          }
          const emojiFrame = await new CanvasSink(emojiTrack, {width: 90, height: 90, fit: "contain", alpha: true}).getCanvas(1);
          if (!emojiFrame) throw new Error("no emoji frame at 1s");
          thumbs.push(await toUrl(emojiFrame.canvas));
          return `canvasesAtTimestamps([0.2, 1, 1.8, 2.6]) → ${thumbs.length - 1} of 160×90 · getCanvas(1) with alpha → frame at ${emojiFrame.timestamp.toFixed(3)}s, ${emojiFrame.duration.toFixed(3)}s long`;
        } finally {
          clip.dispose();
          emoji.dispose();
        }
      });

      await add("Conversion: VP8/Opus .webm → .mp4", async () => {
        const input = open("star-struck-0.5x.webm");
        try {
          const output = new Output({format: new Mp4OutputFormat(), target: new BufferTarget()});
          const conversion = await Conversion.init({
            input,
            output,
            trim: {start: 0.5, end: 1.5},
            video: {width: 256, height: 256, fit: "contain", codec: "vp9", bitrate: QUALITY_LOW},
            audio: {codec: "opus"},
          });
          if (!conversion.isValid) throw new Error(`invalid: ${conversion.discardedTracks.map((t) => t.reason).join(", ")}`);
          let progressCalls = 0;
          conversion.onProgress = () => {
            progressCalls++;
          };
          await conversion.execute();
          const buffer = output.target.buffer;
          if (!buffer) throw new Error("no output buffer");
          // Read the finished file back to check what was written.
          const check = new Input({source: new BufferSource(buffer), formats: ALL_FORMATS});
          try {
            const video = await check.getPrimaryVideoTrack();
            return `${(buffer.byteLength / 1024).toFixed(1)} KB · read back: ${await check.getMimeType()} · ${video?.displayWidth}×${video?.displayHeight} · ${(await check.computeDuration()).toFixed(2)}s · ${progressCalls} onProgress`;
          } finally {
            check.dispose();
          }
        } finally {
          input.dispose();
        }
      });
      await add("Conversion: H.264/AAC .mp4 → .mkv", async () => {
        const input = open("sample-clip.mp4");
        try {
          const output = new Output({format: new MkvOutputFormat(), target: new BufferTarget()});
          const conversion = await Conversion.init({input, output});
          if (!conversion.isValid) throw new Error(`invalid: ${conversion.discardedTracks.map((t) => t.reason).join(", ")}`);
          await conversion.execute();
          return `${((output.target.buffer?.byteLength ?? 0) / 1024).toFixed(1)} KB · ${conversion.utilizedTracks.map((t) => t.codec).join(" + ")} copied without decoding`;
        } finally {
          input.dispose();
        }
      });
      await add("Conversion: H.264/AAC .mp4 → .webm", async () => {
        const input = open("sample-clip.mp4");
        try {
          const output = new Output({format: new WebMOutputFormat(), target: new BufferTarget()});
          const conversion = await Conversion.init({input, output});
          return `isValid ${conversion.isValid} · discarded ${conversion.discardedTracks.map((t) => `${t.track.codec}: ${t.reason}`).join(", ")}`;
        } finally {
          input.dispose();
        }
      });
      // cancel() is documented to make execute() throw a
      // ConversionCanceledError. Called from onProgress while tracks are
      // still being written, execute() rejects first with a plain "Output has
      // been canceled." Error from the in-flight write; the row shows which.
      await add("Conversion.cancel()", async () => {
        const input = open("sample-clip.webm");
        try {
          const output = new Output({format: new WebMOutputFormat(), target: new BufferTarget()});
          const conversion = await Conversion.init({input, output, video: {width: 320, bitrate: QUALITY_LOW}});
          conversion.onProgress = () => {
            void conversion.cancel();
          };
          try {
            await conversion.execute();
            return `finished before the cancel landed · state ${conversion.state}`;
          } catch (err) {
            return `execute() rejected · ConversionCanceledError ${err instanceof ConversionCanceledError} · ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)} · state ${conversion.state}`;
          }
        } finally {
          input.dispose();
        }
      });

      if (!cancelled) {
        setRows(results);
        setThumbnails(thumbs);
        continueRender(handle);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle, continueRender]);

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, flexDirection: "row", padding: "34px 36px", gap: 26}}>
      <div style={{width: 900, display: "flex", flexDirection: "column"}}>
        <div style={{color: palette.textDim, fontSize: 22}}>Mediabunny, the library under @remotion/media · run in the render browser</div>
        <div style={{display: "flex", gap: 10, marginTop: 12, height: 90}}>
          {thumbnails.map((src) => (
            <Img key={src} src={src} style={{height: 90, borderRadius: 6}} />
          ))}
        </div>
        <div style={{marginTop: 12, display: "flex", flexDirection: "column", gap: 5}}>
          {(rows ?? []).map((row) => (
            <div key={row.label} style={{display: "flex", gap: 12, fontFamily: "monospace", fontSize: 12, lineHeight: 1.3}}>
              <div style={{width: 250, flexShrink: 0, color: palette.textDim, textAlign: "right"}}>{row.label}</div>
              <div style={{color: row.ok ? palette.text : "#f87171"}}>{row.ok ? row.value : `failed: ${row.value}`}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: palette.textDim, fontSize: 14, textAlign: "center"}}>
        {/* VP9 + Opus decodes here, so <Video> plays it through Mediabunny,
            sound included: the 220 + 330 Hz tone, lowered to 176 + 264 Hz by
            toneFrequency 0.8. It starts at frame 5 and fades in over 20 frames;
            trimBefore 45 with loop makes it wrap every 1.5s. The docs say
            "repeat" restarts the fade on each loop, but in 4.0.527 the
            restart period is the untrimmed file (90 frames), so it doesn't
            restart at the wrap in frame 50 (see docs/findings.md; the
            AudioScene tone uses "extend"). name/showInTimeline label it in the
            Studio timeline; debugOverlay draws decoder stats in the Studio and
            Player only. */}
        <Video
          src={staticFile("sample-clip-tone.webm")}
          name="Tone clip (VP9 + Opus)"
          from={5}
          durationInFrames={70}
          trimBefore={45}
          volume={(f) => interpolate(f, [0, 20], [0, 0.8], {extrapolateRight: "clamp"})}
          loop
          loopVolumeCurveBehavior="repeat"
          toneFrequency={0.8}
          audioStreamIndex={0}
          showInTimeline
          debugOverlay={false}
          onError={() => "fail"}
          style={{width: 272, height: 153, borderRadius: 8}}
        />
        <div>{"<Video> sample-clip-tone .webm: decoded by Mediabunny"}</div>
        {/* H.264 can't be decoded here, so <Video> falls back to
            <OffthreadVideo> and hands it fallbackOffthreadVideoProps. In a
            render only toneMapped, transparent and onError apply; the rest
            steer playback in the Studio and Player. */}
        <Video
          src={staticFile("sample-clip.mp4")}
          muted
          style={{width: 272, height: 153, borderRadius: 8}}
          fallbackOffthreadVideoProps={{
            toneMapped: true,
            transparent: false,
            onError: (err) => console.warn("OffthreadVideo fallback:", err.message),
            acceptableTimeShiftInSeconds: 0.3,
            crossOrigin: "anonymous",
            useWebAudioApi: false,
            pauseWhenBuffering: true,
            onAutoPlayError: null,
            preservePitch: true,
          }}
        />
        <div>{"<Video> sample-clip .mp4: falls back to <OffthreadVideo>"}</div>
        {/* AAC can't be decoded here either, so <Audio> falls back to
            <Html5Audio> with fallbackHtml5AudioProps. It plays the tone at its
            own pitch from frame 15 for 45 frames, muted until frame 25. */}
        <Audio
          src={staticFile("sample-tone.m4a")}
          from={15}
          durationInFrames={45}
          muted={frame < 25}
          fallbackHtml5AudioProps={{
            onError: (err) => console.warn("Html5Audio fallback:", err.message),
            useWebAudioApi: false,
            acceptableTimeShiftInSeconds: 0.3,
            pauseWhenBuffering: true,
            crossOrigin: "anonymous",
            preservePitch: true,
          }}
        />
        <div>{"<Audio> sample-tone .m4a: falls back to <Html5Audio>"}</div>
      </div>
    </AbsoluteFill>
  );
};
