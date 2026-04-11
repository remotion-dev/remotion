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

    if (content.audioTimestamps) {
      // ElevenLabs character-level timestamps
      const {
        characterStartTimesSeconds: charStarts,
        characterEndTimesSeconds: charEnds,
      } = content.audioTimestamps;

      const lenMs = Math.ceil(charEnds[charEnds.length - 1] * 1000);

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

      const words = content.text.split(" ");
      const MaxSentenseSizeChars = 14;

      let currentText = "";
      let currentStartMs = charStarts[0] * 1000 + durationMs;
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
        for (let j = 0; j < word.length; j++) {
          currentEndMs = charEnds[currentCharIndex] * 1000 + durationMs;
          currentCharIndex++;
        }

        currentEndMs = charEnds[currentCharIndex] * 1000 + durationMs;
        currentCharIndex++;
      }

      if (currentText.trim().length > 0) {
        const textElem: TextElement = {
          startMs: currentStartMs,
          endMs: charEnds[charEnds.length - 1] * 1000 + durationMs,
          text: currentText.trim(),
          position: "center",
          animations: getTextAnimations(),
        };

        timeline.text.push(textElem);
      }

      durationMs += lenMs;
    } else if (content.wordTimestamps) {
      // Typecast word-level timestamps (via Whisper)
      const { wordTimestamps } = content;

      const lenMs = Math.ceil(
        wordTimestamps[wordTimestamps.length - 1].end * 1000,
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

      const MaxSentenseSizeChars = 14;
      let currentWords: string[] = [];
      let currentStartMs = wordTimestamps[0].start * 1000 + durationMs;
      let currentEndMs = durationMs;

      for (const wordTs of wordTimestamps) {
        const candidateText = [...currentWords, wordTs.word].join(" ");

        if (
          candidateText.length > MaxSentenseSizeChars &&
          currentWords.length > 0
        ) {
          const endMs = Math.max(currentEndMs, currentStartMs + 100);
          const textElem: TextElement = {
            startMs: currentStartMs,
            endMs,
            text: currentWords.join(" "),
            position: "center",
            animations: getTextAnimations(),
          };

          timeline.text.push(textElem);

          currentWords = [];
          currentStartMs = endMs;
        }

        currentWords.push(wordTs.word);
        currentEndMs = wordTs.end * 1000 + durationMs;
      }

      if (currentWords.length > 0) {
        const lastEndMs =
          wordTimestamps[wordTimestamps.length - 1].end * 1000 + durationMs;
        const textElem: TextElement = {
          startMs: currentStartMs,
          endMs: Math.max(lastEndMs, currentStartMs + 100),
          text: currentWords.join(" "),
          position: "center",
          animations: getTextAnimations(),
        };

        timeline.text.push(textElem);
      }

      durationMs += lenMs;
    }

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
