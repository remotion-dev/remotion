// Generates MP3 voiceover files with the ElevenLabs Text-to-Speech API and
// writes them to public/voiceover/, where a component can play them back
// with <Audio src={staticFile("voiceover/<id>.mp3")} /> (see audio.md) and
// size a composition to match with calculateMetadata + getAudioDuration
// (see calculate-metadata.md / voiceover.md skill guides).
//
// The API key is only ever read here, in this standalone script's process —
// never inside a Remotion component. Component code gets bundled for the
// browser/Chromium, and Remotion's own .env/.env.local files are exposed to
// that bundle's process.env (see env-variables.mdx), so a key referenced
// from a .tsx file would ship inside the render bundle.
//
// Usage:
//   cp .env.example .env.local   # then fill in ELEVENLABS_API_KEY
//   node scripts/generate-voiceover.mjs
//
// Edit the SCENES array below to match your composition's scenes.

import {existsSync, mkdirSync, writeFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const envFile of [".env.local", ".env"]) {
  const envPath = join(projectRoot, envFile);
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
    break;
  }
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error(
    "ELEVENLABS_API_KEY is not set. Copy .env.example to .env.local and fill in your key (get one at https://elevenlabs.io).",
  );
  process.exit(1);
}

// Rachel, one of ElevenLabs' default voices. Swap for any voice ID from
// https://api.elevenlabs.io/v1/voices (or the ElevenLabs dashboard).
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

const SCENES = [
  {id: "scene-01-intro", text: "Welcome to the show."},
];

const outDir = join(projectRoot, "public", "voiceover");
mkdirSync(outDir, {recursive: true});

for (const scene of SCENES) {
  console.log(`Generating ${scene.id}...`);
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${scene.voiceId ?? DEFAULT_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: scene.text,
        model_id: "eleven_multilingual_v2",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error for ${scene.id}: ${response.status} ${await response.text()}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const outPath = join(outDir, `${scene.id}.mp3`);
  writeFileSync(outPath, audioBuffer);
  console.log(`  -> public/voiceover/${scene.id}.mp3 (${(audioBuffer.length / 1024).toFixed(0)}KB)`);
}
