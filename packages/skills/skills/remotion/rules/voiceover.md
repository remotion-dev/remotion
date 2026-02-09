---
name: voiceover
description: Adding AI-generated voiceover to Remotion compositions using ElevenLabs TTS
metadata:
  tags: voiceover, audio, elevenlabs, tts, speech, calculateMetadata, dynamic duration
---

# Adding AI voiceover to a Remotion composition

Use ElevenLabs TTS to generate speech audio per scene, then use `calculateMetadata` to dynamically size the composition to match the audio.

## Prerequisites

An **ElevenLabs API key** is required. Store it in a `.env` file at the project root:

```
ELEVENLABS_API_KEY=your_key_here
```

**MUST** ask the user for their ElevenLabs API key if no `.env` file exists or `ELEVENLABS_API_KEY` is not set. **MUST NOT** fall back to other TTS tools (e.g. `say`, `espeak`, Google TTS, or any other provider). ElevenLabs is the only supported voice engine for this workflow.

Install `dotenv` if not already present:

```bash
npm install dotenv
```

## Defining scene text

Create a JSON config file that maps each scene to its voiceover text. The config can live anywhere in the project — a common convention is a `voiceover-configs/` directory.

```json
{
  "compositionId": "MyComposition",
  "voice": "kPzsL2i3teMYv0FxEYQ6",
  "scenes": [
    { "id": "scene-01-intro", "text": "Welcome to the show." },
    { "id": "scene-02-main", "text": "Here is the main point." },
    { "id": "scene-03-outro", "text": "Thanks for watching." }
  ]
}
```

- `compositionId` identifies which composition these scenes belong to.
- `voice` is an ElevenLabs voice ID. Optional — the generation script should define a sensible default.
- Each scene has a unique `id` (used as the output filename) and `text` to speak.

Conversational phrasing produces more natural-sounding speech than formal writing.

## Generating audio with ElevenLabs

Create a script that reads the config, calls the ElevenLabs API for each scene, and writes MP3 files to the `public/` directory so Remotion can access them via `staticFile()`.

The core API call for a single scene:

```ts
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: scene.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
      },
    }),
  }
);

const audioBuffer = Buffer.from(await response.arrayBuffer());
writeFileSync(`public/voiceover/${compositionId}/${scene.id}.mp3`, audioBuffer);
```

After writing each MP3, the script **MUST** measure its duration and write a `manifest.json` alongside the audio files:

```json
{
  "scenes": [
    { "id": "scene-01-intro", "file": "scene-01-intro.mp3", "durationInSeconds": 2.45 },
    { "id": "scene-02-main", "file": "scene-02-main.mp3", "durationInSeconds": 3.12 }
  ]
}
```

Use `parseMedia()` from `@remotion/media-parser` to measure each MP3 after writing it:

```ts
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";

const { durationInSeconds } = await parseMedia({
  src: filepath,
  fields: { durationInSeconds: true },
  reader: nodeReader,
});
```

The script **MUST**:

- Load the API key from environment variables — never hardcode it.
- Write output to `public/voiceover/<compositionId>/` so files are available via `staticFile()`.
- Write a `manifest.json` with per-scene durations so `calculateMetadata` can read them without re-parsing audio at runtime.
- Add a delay between requests (e.g. 500ms) to respect rate limits.
- Provide clear error messages when the API key is missing or a request fails.

Add a `package.json` script so it can be run as:

```bash
npm run generate:voiceover -- <composition-id>
```

Generated audio files **MUST** be added to `.gitignore`:

```
public/voiceover/
```

## Dynamic duration with calculateMetadata

Use `calculateMetadata` to read the manifest and compute the composition length from the pre-measured durations. This ensures scenes are exactly as long as their voiceover requires — no runtime audio parsing needed.

```tsx
import { CalculateMetadataFunction, staticFile } from "remotion";

// Fallback durations (in frames) used when audio files don't exist yet
const FALLBACK_DURATIONS = [75, 90, 105];
const AUDIO_PADDING_FRAMES = 12; // breathing room after each clip
const FPS = 30;

const MANIFEST_PATH = "voiceover/my-comp/manifest.json";

const SCENE_AUDIO_FILES = [
  "voiceover/my-comp/scene-01-intro.mp3",
  "voiceover/my-comp/scene-02-main.mp3",
  "voiceover/my-comp/scene-03-outro.mp3",
];

type Manifest = {
  scenes: { id: string; file: string; durationInSeconds: number }[];
};

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  try {
    const res = await fetch(staticFile(MANIFEST_PATH));
    const manifest: Manifest = await res.json();

    const sceneDurations = manifest.scenes.map((scene, i) => {
      const audioFrames = Math.ceil(scene.durationInSeconds * FPS);
      return Math.max(audioFrames + AUDIO_PADDING_FRAMES, FALLBACK_DURATIONS[i]);
    });

    return {
      durationInFrames: sceneDurations.reduce((sum, d) => sum + d, 0),
      props: { ...props, voiceover: { sceneDurations } },
    };
  } catch {
    return {
      durationInFrames: FALLBACK_DURATIONS.reduce((sum, d) => sum + d, 0),
    };
  }
};
```

Key rules:

- **MUST** wrap the manifest fetch in `try/catch`. The composition must render without audio files so it works during development before generation.
- **MUST** define `FALLBACK_DURATIONS` — one value per scene. These are the scene lengths used when no audio exists.
- `AUDIO_PADDING_FRAMES` adds a short pause after each clip before the next scene begins. 12 frames (~0.4s at 30fps) is a good starting point.
- The computed `sceneDurations` are passed into the component via a `voiceover` prop so the component knows whether audio exists and how long each scene should be.

If the composition uses `<TransitionSeries>`, subtract the overlap from total duration:

```tsx
const numTransitions = sceneDurations.length - 1;
const totalFrames =
  sceneDurations.reduce((sum, d) => sum + d, 0) -
  numTransitions * TRANSITION_FRAMES;
```

## Rendering audio in the component

Add an optional `voiceover` prop to the component schema:

```tsx
const myCompSchema = z.object({
  // ... other props
  voiceover: z
    .object({ sceneDurations: z.array(z.number()) })
    .optional(),
});
```

Use the `voiceover` prop to decide scene lengths and whether to render `<Audio>`:

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const MyComposition: React.FC<Props> = ({ voiceover }) => {
  const durations = voiceover?.sceneDurations ?? FALLBACK_DURATIONS;
  const hasAudio = !!voiceover;

  return (
    <>
      <Sequence durationInFrames={durations[0]}>
        <IntroScene />
        {hasAudio && <Audio src={staticFile(SCENE_AUDIO_FILES[0])} />}
      </Sequence>
      <Sequence from={durations[0]} durationInFrames={durations[1]}>
        <MainScene />
        {hasAudio && <Audio src={staticFile(SCENE_AUDIO_FILES[1])} />}
      </Sequence>
      {/* ... more scenes */}
    </>
  );
};
```

**MUST NOT** render `<Audio>` unconditionally — the files won't exist until generation runs.

This pattern works with any sequencing approach: `<Sequence>`, `<Series>`, or `<TransitionSeries>`. The core idea is the same — use `durations[i]` for each scene's length, and conditionally render `<Audio>` inside each scene.

## Delaying audio start

If audio should not start on the first frame of a scene (e.g. to let a visual entrance finish), wrap it in a `<Sequence>`:

```tsx
<Sequence from={6}>
  <Audio src={staticFile(SCENE_AUDIO_FILES[0])} />
</Sequence>
```

## Tuning

- **Silence at end of a scene**: Lower that scene's value in `FALLBACK_DURATIONS` or reduce `AUDIO_PADDING_FRAMES`.
- **Audio gets cut off**: Increase `AUDIO_PADDING_FRAMES` or that scene's fallback.
- **Speech sounds robotic**: Rewrite the text conversationally. Short sentences with natural rhythm work best.
- **Different voice per scene**: Set `"voice"` in the config JSON per-composition, or override via a CLI flag in the generation script.
