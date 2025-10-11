import { staticFile } from "remotion";
import { z } from "zod";

const SOUNDS_FOLDER = "sounds";
export const AUDIO_FADE_IN_FRAMES = 30;
export const BACKGROUND_VOLUME = 0.04;
export const REGULAR_VOLUME = 1;

export const music = z.enum(["previous", "soft", "epic", "euphoric", "none"]);

type Music = z.infer<typeof music>;

export const getAudioSource = (track: Music) => {
  if (track === "none") {
    return "none";
  }

  if (track === "soft") {
    return staticFile(`${SOUNDS_FOLDER}/utope-nature.mp3`);
  }

  if (track === "euphoric") {
    return staticFile(`${SOUNDS_FOLDER}/utope-i-woke-up-in-a-dream.mp3`);
  }

  if (track === "epic") {
    return staticFile(`${SOUNDS_FOLDER}/utope-rhythmic-reverie.mp3`);
  }

  throw new Error(`No sound track for ${track}`);
};
