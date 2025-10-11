import { Caption } from "@remotion/captions";
import { StaticFile } from "@remotion/studio";

export const fetchCaptions = async (
  file: StaticFile | null,
): Promise<Caption[] | null> => {
  if (!file) {
    return null;
  }

  try {
    const res = await fetch(file.src);
    const data = await res.json();
    if (data.systeminfo) {
      throw new Error(
        `The file ${file.src} is a Whisper.cpp output. The file format has changed, you can migrate using: https://gist.github.com/JonnyBurger/96e1c1945e16ba1a54530d127f4060d5`,
      );
    }
    const captions = data as Caption[];
    return captions;
  } catch (error) {
    console.error("Error fetching WhisperOutput from JSON:", error);
    return null;
  }
};
