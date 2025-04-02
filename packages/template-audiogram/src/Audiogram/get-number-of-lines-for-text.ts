import { Caption } from "@remotion/captions";
import { fillTextBox } from "@remotion/layout-utils";
import { msToFrame } from "../helpers/ms-to-frame";
import { LINES_PER_PAGE } from "./constants";

export const layoutText = ({
  captions,
  textBoxWidth,
  fontFamily,
  fontSize,
}: {
  captions: Caption[];
  textBoxWidth: number;
  fontFamily: string;
  fontSize: number;
}) => {
  const box = fillTextBox({
    maxBoxWidth: textBoxWidth,
    maxLines: 1_000,
  });

  const lines: Caption[][] = [[]];

  for (const caption of captions) {
    const isFirstCaption = captions.indexOf(caption) === 0;
    const { newLine } = box.add({
      text: isFirstCaption ? caption.text.trimStart() : caption.text,
      fontFamily,
      fontSize,
    });

    if (newLine) {
      lines.push([]);
    }

    const newCaption = { ...caption };
    if (newLine || isFirstCaption) {
      newCaption.text = newCaption.text.trimStart();
      box.add({
        text: " ".repeat(caption.text.length - newCaption.text.length),
        fontFamily,
        fontSize,
      });
    }

    lines[lines.length - 1].push(newCaption);
  }

  return lines;
};

export const filterCurrentlyDisplayedLines = ({
  lines,
  frame,
}: {
  lines: Caption[][];
  frame: number;
}) => {
  const currentlyActiveLines = lines.filter((line) => {
    return line.some((item) => {
      return msToFrame(item.startMs) < frame;
    });
  });

  // Return the last 4 lines
  return currentlyActiveLines.slice(-LINES_PER_PAGE);
};
