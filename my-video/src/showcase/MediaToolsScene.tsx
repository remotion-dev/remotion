import {WEBCODECS_TIMESCALE, hasBeenAborted, mediaParserController, parseMedia} from "@remotion/media-parser";
import type {MediaParserAudioTrack, MediaParserTrack, MediaParserVideoTrack} from "@remotion/media-parser";
import {universalReader} from "@remotion/media-parser/universal";
import {webReader} from "@remotion/media-parser/web";
import {parseMediaOnWebWorker} from "@remotion/media-parser/worker";
import {
  canCopyAudioTrack,
  canCopyVideoTrack,
  canReencodeAudioTrack,
  canReencodeVideoTrack,
  convertAudioData,
  convertMedia,
  createAudioDecoder,
  createVideoDecoder,
  defaultOnAudioTrackHandler,
  defaultOnVideoTrackHandler,
  extractFrames,
  getAvailableAudioCodecs,
  getAvailableContainers,
  getAvailableVideoCodecs,
  getDefaultAudioCodec,
  getDefaultVideoCodec,
  getPartialAudioData,
  rotateAndResizeVideoFrame,
  webcodecsController,
} from "@remotion/webcodecs";
import {bufferWriter} from "@remotion/webcodecs/buffer";
import {webFsWriter} from "@remotion/webcodecs/web-fs";
import {useEffect, useState} from "react";
import {AbsoluteFill, Img, staticFile, useDelayRender, useVideoConfig} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

type Row = {label: string; value: string; ok: boolean};

const MP4 = staticFile("sample-clip.mp4");
const WEBM = staticFile("sample-clip.webm");
const WAV = staticFile("sample-tone.wav");

// staticFile() returns a root-relative path ("/public/..."). Two readers
// don't accept that: a web worker has no page URL to resolve it against
// ("... is not a URL"), and universalReader takes a leading "/" for a
// filesystem path and calls Node's fs (which fails in the browser). Both
// get an absolute URL instead.
const absolute = (src: string) => new URL(src, window.location.href).href;

// Runs one experiment and records its real outcome: the result text, or the
// error message if it threw. Nothing here is assumed to work.
const attempt = async (label: string, fn: () => Promise<string>): Promise<Row> => {
  try {
    return {label, value: await fn(), ok: true};
  } catch (err) {
    return {label, value: err instanceof Error ? err.message : String(err), ok: false};
  }
};

const videoTrackOf = (tracks: MediaParserTrack[]): MediaParserVideoTrack => {
  const track = tracks.find((t): t is MediaParserVideoTrack => t.type === "video");
  if (!track) throw new Error("no video track");
  return track;
};

const audioTrackOf = (tracks: MediaParserTrack[]): MediaParserAudioTrack => {
  const track = tracks.find((t): t is MediaParserAudioTrack => t.type === "audio");
  if (!track) throw new Error("no audio track");
  return track;
};

// Demonstrates @remotion/media-parser and @remotion/webcodecs, both run for
// real in the render browser against the local sample assets:
//
// - media-parser: parseMedia() with webReader, universalReader and on a web
//   worker (parseMediaOnWebWorker), a mediaParserController() aborted on
//   purpose and recognised with hasBeenAborted(), and WEBCODECS_TIMESCALE.
// - webcodecs: the container/codec catalog functions, the can*Track()
//   checks, extractFrames() + rotateAndResizeVideoFrame() (the thumbnails),
//   createVideoDecoder()/createAudioDecoder() fed by parseMedia(),
//   getPartialAudioData() + convertAudioData(), and two convertMedia() runs,
//   one per writer (bufferWriter in memory, webFsWriter to the origin-private
//   file system), with webcodecsController() and the default track handlers.
//
// This Chromium can't decode H.264 or AAC through WebCodecs, which is why the
// .mp4 checks come out false and the decoding work uses the VP9 .webm and the
// PCM .wav instead. parseMedia() itself only reads container structure, so it
// handles the .mp4 fine. parseMedia() is deprecated in favour of Mediabunny
// (https://www.remotion.dev/docs/mediabunny/metadata). The Node-only readers
// and writers (nodeReader, nodeWriter, parseMediaOnServerWorker,
// downloadAndParseMedia) are exercised in scripts/renderer-apis.mjs.
export const MediaToolsScene: React.FC = () => {
  const {width} = useVideoConfig();
  const {delayRender, continueRender} = useDelayRender();
  const [handle] = useState(() => delayRender("Running media-parser / webcodecs experiments"));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: Row[] = [];
      const add = async (label: string, fn: () => Promise<string>) => {
        results.push(await attempt(label, fn));
      };

      let mp4Tracks: MediaParserTrack[] = [];
      let webmTracks: MediaParserTrack[] = [];
      await add("parseMedia(mp4, webReader)", async () => {
        const r = await parseMedia({
          src: MP4,
          reader: webReader,
          controller: mediaParserController(),
          acknowledgeRemotionLicense: true,
          fields: {container: true, durationInSeconds: true, dimensions: true, fps: true, videoCodec: true, audioCodec: true, tracks: true},
        });
        mp4Tracks = r.tracks;
        return `${r.container} · ${r.videoCodec}/${r.audioCodec} · ${r.dimensions?.width}×${r.dimensions?.height} · ${r.fps}fps · ${r.durationInSeconds?.toFixed(2)}s`;
      });
      await add("parseMediaOnWebWorker(webm)", async () => {
        const r = await parseMediaOnWebWorker({src: absolute(WEBM), acknowledgeRemotionLicense: true, fields: {container: true, videoCodec: true, tracks: true}});
        webmTracks = r.tracks;
        return `${r.container} · ${r.videoCodec} · ${r.tracks.length} track`;
      });
      await add("parseMedia(wav, universalReader)", async () => {
        const r = await parseMedia({src: absolute(WAV), reader: universalReader, acknowledgeRemotionLicense: true, fields: {sampleRate: true, numberOfAudioChannels: true, audioCodec: true}});
        return `${r.audioCodec} · ${r.sampleRate}Hz · ${r.numberOfAudioChannels}ch`;
      });
      await add("mediaParserController().abort()", async () => {
        const controller = mediaParserController();
        controller.abort();
        try {
          await parseMedia({src: MP4, reader: webReader, controller, acknowledgeRemotionLicense: true, fields: {durationInSeconds: true}});
          return "resolved (abort had no effect)";
        } catch (err) {
          return `rejected · hasBeenAborted(): ${hasBeenAborted(err)}`;
        }
      });
      await add("WEBCODECS_TIMESCALE", async () => `${WEBCODECS_TIMESCALE} ticks per second`);

      await add("getAvailableContainers()", async () =>
        getAvailableContainers()
          .map((c) => `${c} (${getAvailableVideoCodecs({container: c}).join("/") || "no video"}; default ${getDefaultVideoCodec({container: c}) ?? "none"}/${getDefaultAudioCodec({container: c})})`)
          .join(" · "),
      );
      await add("available audio codecs (webm)", async () => getAvailableAudioCodecs({container: "webm"}).join(", "));
      await add("canCopyVideoTrack h264 → webm", async () =>
        String(canCopyVideoTrack({inputContainer: "mp4", inputTrack: videoTrackOf(mp4Tracks), rotationToApply: 0, outputContainer: "webm", outputVideoCodec: "vp8", resizeOperation: null})),
      );
      await add("canCopyVideoTrack vp9 → webm", async () =>
        String(canCopyVideoTrack({inputContainer: "webm", inputTrack: videoTrackOf(webmTracks), rotationToApply: 0, outputContainer: "webm", outputVideoCodec: "vp9", resizeOperation: null})),
      );
      await add("canReencodeVideoTrack → vp8 (h264 | vp9 in)", async () => {
        const fromH264 = await canReencodeVideoTrack({videoCodec: "vp8", track: videoTrackOf(mp4Tracks), resizeOperation: null, rotate: 0});
        const fromVp9 = await canReencodeVideoTrack({videoCodec: "vp8", track: videoTrackOf(webmTracks), resizeOperation: null, rotate: 0});
        return `${fromH264} | ${fromVp9}`;
      });
      await add("canCopyAudioTrack / canReencodeAudioTrack aac → opus", async () => {
        const copy = canCopyAudioTrack({inputCodec: "aac", inputContainer: "mp4", outputContainer: "webm", outputAudioCodec: "opus"});
        const reencode = await canReencodeAudioTrack({track: audioTrackOf(mp4Tracks), audioCodec: "opus", bitrate: 128000, sampleRate: null});
        return `${copy} / ${reencode}`;
      });

      const thumbs: string[] = [];
      await add("extractFrames(webm) + rotateAndResizeVideoFrame()", async () => {
        await extractFrames({
          src: WEBM,
          timestampsInSeconds: [0.5, 1.5, 2.5],
          acknowledgeRemotionLicense: true,
          onFrame: (frame) => {
            const small = rotateAndResizeVideoFrame({frame, rotation: 0, resizeOperation: {mode: "width", width: 160}});
            const canvas = document.createElement("canvas");
            canvas.width = small.displayWidth;
            canvas.height = small.displayHeight;
            canvas.getContext("2d")?.drawImage(small, 0, 0);
            thumbs.push(canvas.toDataURL("image/png"));
            if (small !== frame) small.close();
            frame.close();
          },
        });
        return `${thumbs.length} frames, resized to 160px wide`;
      });
      await add("createVideoDecoder() via parseMedia", async () => {
        let decoded = 0;
        // Decoder errors arrive in a callback; keep them and rethrow after
        // parsing, so they land in this row instead of escaping as uncaught.
        let decodeError: Error | null = null;
        await parseMedia({
          src: WEBM,
          reader: webReader,
          acknowledgeRemotionLicense: true,
          onVideoTrack: async ({track}) => {
            const decoder = await createVideoDecoder({
              track,
              onFrame: (frame) => {
                decoded++;
                frame.close();
              },
              onError: (err) => {
                decodeError = err;
              },
            });
            return async (sample) => {
              await decoder.waitForQueueToBeLessThan(10);
              await decoder.decode(sample);
              return async () => {
                await decoder.flush();
                decoder.close();
              };
            };
          },
        });
        if (decodeError) throw decodeError;
        return `${decoded} VP9 frames decoded`;
      });
      await add("createAudioDecoder() via parseMedia", async () => {
        let chunks = 0;
        let decodeError: Error | null = null;
        await parseMedia({
          src: WAV,
          reader: webReader,
          acknowledgeRemotionLicense: true,
          onAudioTrack: async ({track}) => {
            const decoder = await createAudioDecoder({
              track,
              onFrame: (audioData) => {
                chunks++;
                audioData.close();
              },
              onError: (err) => {
                decodeError = err;
              },
            });
            return async (sample) => {
              await decoder.waitForQueueToBeLessThan(10);
              await decoder.decode(sample);
              return async () => {
                await decoder.flush();
                decoder.close();
              };
            };
          },
        });
        if (decodeError) throw decodeError;
        return `${chunks} PCM AudioData chunks decoded`;
      });
      await add("getPartialAudioData() + convertAudioData()", async () => {
        const samples = await getPartialAudioData({src: WAV, fromSeconds: 0, toSeconds: 0.1, channelIndex: 0, signal: new AbortController().signal});
        const peak = samples.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
        const original = new AudioData({format: "f32", sampleRate: 44100, numberOfFrames: samples.length, numberOfChannels: 1, timestamp: 0, data: samples});
        const resampled = convertAudioData({audioData: original, newSampleRate: 16000});
        const text = `${samples.length} samples, peak ${peak.toFixed(2)} → ${resampled.numberOfFrames} at 16kHz`;
        original.close();
        resampled.close();
        return text;
      });
      await add("convertMedia(webm vp9 → vp8, bufferWriter)", async () => {
        const start = performance.now();
        const result = await convertMedia({
          src: WEBM,
          container: "webm",
          videoCodec: "vp8",
          writer: bufferWriter,
          controller: webcodecsController(),
          onVideoTrack: defaultOnVideoTrackHandler,
          onAudioTrack: defaultOnAudioTrackHandler,
        });
        const blob = await result.save();
        await result.remove();
        return `${(blob.size / 1024).toFixed(0)} KB in ${((performance.now() - start) / 1000).toFixed(1)}s`;
      });
      await add("convertMedia(wav → webm opus, webFsWriter)", async () => {
        const result = await convertMedia({src: WAV, container: "webm", audioCodec: "opus", writer: webFsWriter});
        const blob = await result.save();
        await result.remove();
        return `${(blob.size / 1024).toFixed(1)} KB`;
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
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, alignItems: "center"}}>
      <div style={{marginTop: 40, width, textAlign: "center", color: palette.textDim, fontSize: 24}}>
        @remotion/media-parser · @remotion/webcodecs · run for real in the render browser
      </div>
      <div style={{display: "flex", gap: 12, marginTop: 14, height: 90}}>
        {thumbnails.map((src) => (
          <Img key={src} src={src} style={{height: 90, borderRadius: 6}} />
        ))}
      </div>
      <div style={{marginTop: 14, width: 1180, display: "flex", flexDirection: "column", gap: 5}}>
        {(rows ?? []).map((row) => (
          <div key={row.label} style={{display: "flex", gap: 14, fontFamily: "monospace", fontSize: 13, lineHeight: 1.3}}>
            <div style={{width: 390, flexShrink: 0, color: palette.textDim, textAlign: "right"}}>{row.label}</div>
            <div style={{color: row.ok ? palette.text : "#f87171"}}>{row.ok ? row.value : `failed: ${row.value}`}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
