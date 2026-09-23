import {Audio, getTargetSampleRate} from "@remotion/media";
import {
  audioBufferToDataUrl,
  createSmoothSvgPath,
  getAudioData,
  getImageDimensions,
  getWaveformPortion,
  useAudioData,
  useWindowedAudioData,
  visualizeAudio,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import {useEffect, useState} from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import {palette} from "./palette";
import {poppins} from "./font";

const HEIGHT = 160;

// Demonstrates most of @remotion/media-utils in one scene, plus core
// remotion's <Html5Audio>. <Audio> comes from @remotion/media (not core
// remotion) per the audio.md skill guide.
// - useWindowedAudioData() + visualizeAudioWaveform() + createSmoothSvgPath():
//   the oscilloscope line — windowed, so it stays cheap on a long video.
// - useAudioData() (the un-windowed full decode) feeds visualizeAudio()
//   (an FFT spectrum) and getWaveformPortion() (a trimmed volume envelope)
//   for the two bar rows below it.
// - getImageDimensions(): the caption reads real pixel dimensions of
//   sample-clip.gif rather than a hardcoded number.
// - audioBufferToDataUrl(): decodes the wav via the Web Audio API and
//   re-encodes it as a data: URL, played back (muted, so it doesn't double
//   the audible track) through <Html5Audio> instead of a frame-synced
//   <Audio>/<OffthreadVideo> decoder.
// - getAudioData(): the promise-based, non-hook twin of useAudioData() --
//   same decode, callable outside a component's render.
// - getTargetSampleRate() (from @remotion/media, not media-utils): the
//   sample rate this render's audio pipeline actually resamples to.
// getAudioDurationInSeconds()/getVideoMetadata() are intentionally not used
// here — Remotion deprecated both in favor of Mediabunny's getMediaMetadata().
export const AudioScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();

  const {audioData: windowedAudioData, dataOffsetInSeconds} = useWindowedAudioData({
    src: staticFile("sample-tone.wav"),
    frame,
    fps,
    windowInSeconds: 3,
  });

  const fullAudioData = useAudioData(staticFile("sample-tone.wav"));

  const [imageSize, setImageSize] = useState<{width: number; height: number} | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  // getAudioData() is the promise-based, non-hook twin of useAudioData()
  // above -- same decode, but callable outside a component's render (a
  // preprocessing script, for example) rather than tied to a frame.
  const [audioDataDirect, setAudioDataDirect] = useState<Awaited<ReturnType<typeof getAudioData>> | null>(null);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const [handle] = useState(() => delayRender("loading media-utils extras"));
  // The sample rate Remotion's audio pipeline will actually resample to for
  // this render (48kHz by default, or Config.setAudioSampleRate()'s value).
  const targetSampleRate = getTargetSampleRate();

  useEffect(() => {
    (async () => {
      try {
        const dimensions = await getImageDimensions(staticFile("sample-clip.gif"));
        setImageSize(dimensions);
        setAudioDataDirect(await getAudioData(staticFile("sample-tone.wav")));

        const response = await fetch(staticFile("sample-tone.wav"));
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        setDataUrl(audioBufferToDataUrl(audioBuffer));
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    })();
  }, [handle, continueRender, cancelRender]);

  const waveform = windowedAudioData
    ? visualizeAudioWaveform({
        fps,
        frame,
        audioData: windowedAudioData,
        numberOfSamples: 256,
        windowInSeconds: 0.5,
        dataOffsetInSeconds,
        // Off by default here (but on by default for getWaveformPortion()):
        // scales the window so its loudest sample reaches full height.
        normalize: true,
      })
    : null;

  const path = waveform
    ? createSmoothSvgPath({
        points: waveform.map((y, i) => ({
          x: (i / (waveform.length - 1)) * width,
          y: HEIGHT / 2 + (y * HEIGHT) / 2,
        })),
      })
    : null;

  // <Audio>'s volume can be a per-frame function; it's inaudible in a still,
  // so the same function also drives the meter below.
  const volumeAt = (f: number) =>
    interpolate(f, [0, 20, 55, 75], [0, 0.5, 0.5, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const spectrum = fullAudioData
    ? // smoothing (on by default) averages neighbouring frames; off shows the raw per-frame FFT.
      visualizeAudio({fps, frame, audioData: fullAudioData, numberOfSamples: 32, smoothing: false})
    : null;

  const envelope =
    fullAudioData && fullAudioData.durationInSeconds > 0
      ? getWaveformPortion({
          audioData: fullAudioData,
          startTimeInSeconds: 0,
          durationInSeconds: fullAudioData.durationInSeconds,
          numberOfSamples: 32,
        })
      : null;

  // The same envelope with normalize: false keeps raw amplitudes. This tone is
  // steady and quiet (~0.10 per bar), so drawn at the same scale the bars would
  // be ~2px tall; the value is shown as text instead.
  const rawEnvelopePeak =
    fullAudioData && fullAudioData.durationInSeconds > 0
      ? Math.max(
          ...getWaveformPortion({
            audioData: fullAudioData,
            startTimeInSeconds: 0,
            durationInSeconds: fullAudioData.durationInSeconds,
            numberOfSamples: 32,
            normalize: false,
          }).map((bar) => bar.amplitude),
        )
      : null;

  return (
    <AbsoluteFill style={{background: "#0b1120", fontFamily: poppins, justifyContent: "center"}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 26}}>
        @remotion/media-utils · waveform, spectrum, envelope — all real audio data
      </div>
      {path ? (
        <svg width={width} height={HEIGHT}>
          <path d={path} fill="none" stroke={palette.accent2} strokeWidth={3} />
        </svg>
      ) : null}
      <div style={{display: "flex", justifyContent: "center", gap: 3, height: 40, margin: "12px 0"}}>
        {(spectrum ?? []).map((v, i) => (
          <div key={i} style={{width: 6, height: Math.max(2, v * 40), background: palette.accent, alignSelf: "flex-end"}} />
        ))}
      </div>
      <div style={{display: "flex", justifyContent: "center", gap: 3, height: 24}}>
        {(envelope ?? []).map((bar) => (
          <div key={bar.index} style={{width: 6, height: Math.max(2, bar.amplitude * 24), background: palette.textDim, alignSelf: "flex-end"}} />
        ))}
      </div>
      {rawEnvelopePeak === null ? null : (
        <div style={{marginTop: 8, textAlign: "center", color: palette.textDim, fontSize: 13, fontFamily: "monospace"}}>
          getWaveformPortion(): peak-normalized bars · with normalize: false the loudest bar is {rawEnvelopePeak.toFixed(2)}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width,
          textAlign: "center",
          color: palette.text,
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        {imageSize ? `sample-clip.gif is ${imageSize.width}×${imageSize.height}px` : "Measuring…"} · audioBufferToDataUrl → &lt;Html5Audio&gt; (muted)
      </div>
      <div style={{position: "absolute", bottom: 30, width, textAlign: "center", color: palette.textDim, fontSize: 14, fontFamily: "monospace"}}>
        getTargetSampleRate(): {targetSampleRate}Hz
        {audioDataDirect ? ` · getAudioData(): ${audioDataDirect.numberOfChannels}ch @ ${audioDataDirect.sampleRate}Hz, ${audioDataDirect.durationInSeconds.toFixed(2)}s` : ""}
      </div>
      <div style={{position: "absolute", bottom: 100, left: (width - 240) / 2, width: 240, height: 8, borderRadius: 4, background: palette.bgAlt}}>
        <div style={{width: `${volumeAt(frame) * 200}%`, height: "100%", borderRadius: 4, background: palette.accent2}} />
      </div>
      <div style={{position: "absolute", bottom: 112, width, textAlign: "center", color: palette.textDim, fontSize: 13, fontFamily: "monospace"}}>
        {"<Audio volume={(f) => …}>"}: {volumeAt(frame).toFixed(2)}
      </div>
      <Audio src={staticFile("sample-tone.wav")} volume={volumeAt} />
      {dataUrl ? <Html5Audio src={dataUrl} volume={0} /> : null}
    </AbsoluteFill>
  );
};
