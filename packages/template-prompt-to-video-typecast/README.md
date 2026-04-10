# Remotion AI Video Template (Typecast TTS)

Create AI-generated videos using Remotion with Typecast for text-to-speech and OpenAI for story generation.

## Setup

```bash
npm install
cp .env.example .env
# Fill in your API keys in .env
```

## Generate a video

```bash
bun run gen
```

## Preview

```bash
npm run dev
```

## How it works

1. **Story generation** — OpenAI generates a story from your title and topic
2. **Image generation** — DALL-E 3 creates images for each story segment
3. **Voice generation** — Typecast TTS generates narration audio
4. **Timestamp extraction** — OpenAI Whisper extracts word-level timestamps from the audio
5. **Timeline creation** — Timestamps are used to sync captions with audio
6. **Video rendering** — Remotion composes everything into a video
