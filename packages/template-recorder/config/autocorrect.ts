import { Caption } from "@remotion/captions";

const autocorrectWord = (caption: Caption): Caption => {
  // Replace a single word with another one
  if (caption.text === " github") {
    return {
      ...caption,
      text: caption.text.replace("github", " GitHub"),
    };
  }

  // Replace a pattern with a specific word
  if (caption.text.match(/ remotion\.$/)) {
    return {
      ...caption,
      text: caption.text.replace(/ remotion.$/, " Remotion."),
    };
  }
  // Add your own function to remap specific words.

  return caption;
};

export const autocorrectWords = (captions: Caption[]): Caption[] => {
  return captions.map(autocorrectWord);
};
