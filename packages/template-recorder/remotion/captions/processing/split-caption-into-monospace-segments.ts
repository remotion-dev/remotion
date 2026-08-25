import { Caption } from "@remotion/captions";

export const splitCaptionIntoMonospaceSegments = (
  caption: Caption,
): Caption[] => {
  const result: Caption[] = [];
  const { lineBreakAfter, ...captionWithoutLineBreak } = caption;

  const regex = /`([^`]+)`/g; // regex pattern to find text enclosed in backticks
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(caption.text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        ...captionWithoutLineBreak,
        text: caption.text.slice(lastIndex, match.index),
      });
    }

    result.push({
      ...captionWithoutLineBreak,
      text: `${("`" + match[1]) as string}\``,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < caption.text.length) {
    result.push({
      ...captionWithoutLineBreak,
      text: caption.text.slice(lastIndex),
    });
  }

  const lastCaption = result[result.length - 1];
  if (lineBreakAfter && lastCaption) {
    lastCaption.lineBreakAfter = true;
  }

  return result;
};

export const isCaptionMonospace = (caption: Caption) => {
  return caption.text.startsWith("`") && caption.text.endsWith("`");
};

export const removeMonospaceTicks = (caption: Caption) => {
  if (!isCaptionMonospace(caption)) {
    return caption;
  }

  return {
    ...caption,
    text: caption.text.slice(1, -1),
  };
};
