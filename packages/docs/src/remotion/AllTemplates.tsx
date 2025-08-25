		import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Audio, staticFile } from "remotion"; import { useMemo } from "react";

// --- CONFIGURABLE ASSETS --- // 1) Put your narration MP3 here: public/voice_en.mp3 (English TTS of the legend) // 2) Optional ambient ocean sound: public/ocean.wav // You can generate the MP3 with any TTS tool and save it into /public.

const LEGEND_TEXT = Long ago, in the coastal land of Bonto Sikuyu on the island of Selayar, there lived a young man known as Tossureia. He was not of noble birth, but his spirit was greater than wealth or rank. One season, a storm unlike any the people had ever seen rose from the horizon. Yet Tossureia did not run. He raised his hands to the heavens and cried out for his people. A sudden light broke through the storm, and he disappeared into the waves. The sea grew calm, but Tossureia was never seen again. From that day on, the people believed he became the guardian spirit of the sea. Even now, when thunder rolls across Selayar, they whisper his name: Tossureia.;

// Split legend into caption lines (simple split by sentences). const CAPTIONS = LEGEND_TEXT.match(/[^.!?]+[.!?]/g) || [LEGEND_TEXT];

// Caption timings helper: spread lines across narration duration. const makeCaptionTimings = (totalFrames: number) => { const perLine = Math.floor(totalFrames / CAPTIONS.length); const out = CAPTIONS.map((line, i) => ({ start: i * perLine, end: i === CAPTIONS.length - 1 ? totalFrames - 1 : (i + 1) * perLine - 1, text: line.trim(), })); return out; };

export const LegendTossureiaVideo: React.FC<{ // If you know your audio length you can set durationInFrames in Root accordingly. // Otherwise choose a safe buffer (e.g., 90s at 30fps = 2700 frames). }> = () => { const frame = useCurrentFrame();

// Title fade-in const titleOpacity = interpolate(frame, [0, 30], [0, 1]);

// Soft float for background waves const waveY = interpolate(frame % 180, [0, 90, 180], [0, -10, 0]);

// Typing effect for an opening paragraph (first 250 chars) const intro = LEGEND_TEXT.slice(0, 250); const introDisplayed = intro.slice(0, Math.min(intro.length, frame));

// Assume composition duration equals narration length set in Root. We'll compute caption schedule from that. // The Composition's durationInFrames will be used here via Remotion's useVideoConfig inside Root during render. // To keep component standalone, we approximate a 40s timeline at 30fps when not available. const approxTotalFrames = 1200; // fallback used for caption layout; safe for preview const captionTimings = useMemo(() => makeCaptionTimings(approxTotalFrames), []);

return ( <AbsoluteFill className="items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700 p-12"> {/* Audio layers */} <Audio src={staticFile("voice_en.mp3")} /> <Audio src={staticFile("ocean.wav")} startFrom={0} volume={0.25} />

{/* Background Waves */}
  <div
    className="absolute bottom-0 left-0 w-full h-44 bg-blue-500 opacity-30 rounded-t-full"
    style={{ transform: `translateY(${waveY}px)` }}
  />
  <div
    className="absolute bottom-0 left-0 w-full h-32 bg-blue-400 opacity-20 rounded-t-full"
    style={{ transform: `translateY(${-waveY}px)` }}
  />

  {/* Title */}
  <Sequence>
    <h1
      style={{ opacity: titleOpacity }}
      className="text-6xl font-extrabold mb-6 text-center text-yellow-300 drop-shadow-lg tracking-wide"
    >
      The Legend of Tossureia
    </h1>
  </Sequence>

  {/* Intro typing */}
  <Sequence from={20} durationInFrames={260}>
    <p className="max-w-4xl text-2xl leading-relaxed text-white/95 bg-black/35 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
      {introDisplayed}
    </p>
  </Sequence>

  {/* Full subtitles (karaoke highlight per line) */}
  {captionTimings.map((cap, idx) => (
    <Sequence key={idx} from={cap.start} durationInFrames={cap.end - cap.start + 1}>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-5xl w-[90%] text-center">
        <div className="inline-block bg-black/50 px-6 py-4 rounded-xl shadow-lg">
          <p className="text-white text-2xl leading-snug">
            {cap.text}
          </p>
        </div>
      </div>
    </Sequence>
  ))}
</AbsoluteFill>

); };

								// Delete duplicate
										
