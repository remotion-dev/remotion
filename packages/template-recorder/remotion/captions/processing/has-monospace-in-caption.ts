import { Caption } from "@remotion/captions";

export const hasMonoSpaceInCaption = (caption: Caption) => {
  if (caption.text.split("").filter((char) => char === "`").length >= 2) {
    return true;
  }

  return false;
};
