import type {
  BackgroundElement,
  ElementAnimation,
  StoryMetadataWithDetails,
  TextElement,
  Timeline,
} from "../src/lib/types";

export const createTimeLineFromStoryWithDetails = (
  storyWithDetails: StoryMetadataWithDetails,
): Timeline => {
  const timeline: Timeline = {
    elements: [],
    text: [],
    audio: [],
    shortTitle: storyWithDetails.shortTitle,
  };

  let durationMs = 0;
  let zoomIn = true;

  for (let i = 0; i < storyWithDetails.content.length; i++) {
    const content = storyWithDetails.content[i];

    const lenMs = Math.ceil(
      content.audioTimestamps.characterEndTimesSeconds[
        content.audioTimestamps.characterEndTimesSeconds.length - 1
      ] * 1000,
    );

    const bgElem: BackgroundElement = {
      startMs: durationMs,
      endMs: durationMs + lenMs,
      imageUrl: content.uid,
      enterTransition: "blur",
      exitTransition: "blur",
      animations: getBgAnimations(lenMs, zoomIn),
    };

    timeline.elements.push(bgElem);
    timeline.audio.push({
      startMs: durationMs,
      endMs: durationMs + lenMs,
      audioUrl: content.uid,
    });

    // hadnle text word by word
    const words = content.text.split(" ");
    const {
      characterStartTimesSeconds: character_start_times_seconds,
      characterEndTimesSeconds: character_end_times_seconds,
    } = content.audioTimestamps;

    const MaxSentenseSizeChars = 14;

    let currentText = "";
    let currentStartMs = character_start_times_seconds[0] * 1000 + durationMs;
    let currentEndMs = durationMs;
    let currentCharIndex = 0;

    for (const word of words) {
      if ((currentText + word).length > MaxSentenseSizeChars) {
        const textElem: TextElement = {
          startMs: currentStartMs,
          endMs: currentEndMs,
          text: currentText.trim(),
          position: "center",
          animations: getTextAnimations(),
        };

        timeline.text.push(textElem);

        currentText = "";
        currentStartMs = currentEndMs;
      }

      currentText += `${word} `;
      for (let i = 0; i < word.length; i++) {
        currentEndMs =
          character_end_times_seconds[currentCharIndex] * 1000 + durationMs;
        currentCharIndex++;
      }

      currentEndMs =
        character_end_times_seconds[currentCharIndex] * 1000 + durationMs;
      currentCharIndex++;
    }

    if (currentText.trim().length > 0) {
      const textElem: TextElement = {
        startMs: currentStartMs,
        endMs:
          character_end_times_seconds[character_end_times_seconds.length - 1] *
            1000 +
          durationMs,
        text: currentText.trim(),
        position: "center",
        animations: getTextAnimations(),
      };

      timeline.text.push(textElem);
    }

    durationMs += lenMs;

    zoomIn = !zoomIn;
  }

  return timeline;
};

export function findAllSpaceIndexes(str: string) {
  const indexes = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === " ") {
      indexes.push(i);
    }
  }
  return indexes;
}

export const getBgAnimations = (durationMs: number, zoomIn: boolean) => {
  const animations: ElementAnimation[] = [];

  const startMs = 0;
  const endMs = durationMs;

  const scaleFrom = zoomIn ? 1.5 : 1;
  const scaleTo = zoomIn ? 1 : 1.5;

  animations.push({
    type: "scale",
    from: scaleFrom,
    to: scaleTo,
    startMs,
    endMs,
  });

  return animations;
};

export const getTextAnimations = () => {
  const animations: ElementAnimation[] = [];

  const durationMs = 300;

  const startMs = 0;
  const endMs = durationMs;

  // start scale from 0.5 to 0.7
  // eslint-disable-next-line @remotion/deterministic-randomness
  const startScale = Math.random() * 0.2 + 0.5;
  // dont scale with 40% chance
  // eslint-disable-next-line @remotion/deterministic-randomness
  const dontScale = Math.random() > 0.6;
  // eslint-disable-next-line @remotion/deterministic-randomness
  const bounces = Math.random() > 0.5;

  // scale
  animations.push({
    type: "scale",
    from: dontScale ? 1 : startScale,
    to: bounces ? 1.25 : 1,
    startMs,
    endMs,
  });

  if (bounces) {
    animations.push({
      type: "scale",
      from: 1.25,
      to: 1,
      startMs: endMs,
      endMs: endMs + 200,
    });
  }

  return animations;
};
