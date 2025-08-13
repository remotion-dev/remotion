import { Caption } from "@remotion/captions";

export const fixBackticks = (_captions: Caption[]): Caption[] => {
  const newCaptions: Caption[] = [];

  const captions = _captions.map((caption) => {
    return {
      ...caption,
      text: caption.text.replaceAll(/`\s/g, " `"),
    };
  });

  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i] as Caption;
    const previousCaption = captions[i - 1] ?? null;

    if (caption.text.startsWith(". ")) {
      const lastAddedCaption = newCaptions[newCaptions.length - 1] as Caption;
      lastAddedCaption.text += ".";
      caption.text = caption.text.slice(1);
    }

    if (!caption.text.startsWith(" ") && previousCaption) {
      const lastAddedCaption = newCaptions[newCaptions.length - 1] as Caption;
      lastAddedCaption.text += caption.text;
      lastAddedCaption.endMs = caption.endMs;
    } else {
      newCaptions.push(caption);
    }
  }

  return newCaptions.map((w) => {
    return {
      ...w,
      text:
        // Remove double backticks: ` n``px`` rem``otion`` render`
        w.text.replaceAll(/``/g, ""),
    };
  });
};
