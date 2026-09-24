import { Caption } from "@remotion/captions";

export const joinBackticks = (captions: Caption[]): Caption[] => {
  const newCaptions: Caption[] = [];
  for (let i = 0; i < captions.length; i++) {
    const previousCaption = newCaptions[i - 1] ?? null;
    const newCaption = captions[i] as Caption;

    const previousCaptionEndsInMonospace = previousCaption?.text.endsWith("`");

    if (previousCaption && previousCaptionEndsInMonospace) {
      if (newCaption.text.startsWith("`")) {
        previousCaption.text = previousCaption.text.substring(
          0,
          previousCaption.text.length - 1,
        );
        newCaption.text = newCaption.text.slice(1);
      }

      if (newCaption.text.startsWith(" `")) {
        previousCaption.text = previousCaption.text.substring(
          0,
          previousCaption.text.length - 1,
        );
        newCaption.text = " " + newCaption.text.slice(2);
      }
    }

    newCaptions.push(newCaption);
  }

  return newCaptions;
};
