export const FIREBASE_BUCKET_NAME = process.env.FIREBASE_BUCKET_NAME || "";

export const AUDIO_SERVERS = {
  local: `http://localhost:${process.env.SERVER_PORT ?? 5050}`, // For running on local machine

  /**
   * * For example:
   * 1. Remote server: `https://123.45.67.89:5050`
   * 2. Github Codespaces example: `https://krishna-sturdy-space-9q44gx947pqhgg-5050.preview.app.github.dev`
   *
   * * Remove the ending `/` from your URL to avoid CORS errors.
   *  `https://example.com/`  => `https://example.com`
   */
  remote: `ENTER_YOUR_REMOTE_SERVER_URL`, // For running on remote server/ Github Codespaces
} as const;

export const SERVER_URL = AUDIO_SERVERS.local; // Be sure to select your server URL here before launching Remotion Studio or render.

export const audioDirectoryInBucket = "remotion-gtts";

export const voices = {
  "Man 1 (US)": { name: "en-US-Neural2-D", languageCode: "en-US" },
  "Man 2 (US)": { name: "en-US-Neural2-J", languageCode: "en-US" },
  "Woman 1 (US)": { name: "en-US-Neural2-H", languageCode: "en-US" },
  "Woman 2 (US)": { name: "en-US-Neural2-F", languageCode: "en-US" },
} as const;
