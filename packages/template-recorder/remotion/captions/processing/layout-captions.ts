import { Caption } from "@remotion/captions";
import { fillTextBox } from "@remotion/layout-utils";
import { MONOSPACE_FONT, REGULAR_FONT } from "../../../config/fonts";
import { getSafeSpace } from "../../../config/layout";
import { getBorderWidthForSubtitles } from "../boxed/components/CaptionSentence";
import { CaptionPage, LayoutedCaptions } from "../types";
import { hasMonoSpaceInCaption } from "./has-monospace-in-caption";
import {
  isCaptionMonospace,
  removeMonospaceTicks,
  splitCaptionIntoMonospaceSegments,
} from "./split-caption-into-monospace-segments";

const balanceCaptions = ({
  captions,
  captionsFitted,
  boxWidth,
  fontSize,
  maxLines,
}: {
  captions: Caption[];
  captionsFitted: number;
  boxWidth: number;
  maxLines: number;
  fontSize: number;
}) => {
  let bestCut = captionsFitted;

  if (captionsFitted / captions.length > 0.9) {
    // Prevent a few hanging words at the end
    bestCut = captions.length - 5;
  }

  for (let i = 1; i < 4; i++) {
    const index = bestCut - i;
    const caption = (captions[index] as Caption).text.trim();
    if (caption.endsWith(",") || caption.endsWith(".")) {
      bestCut = index + 1;
      break;
    }
  }

  while (
    (bestCut > 1 && hasMonoSpaceInCaption(captions[bestCut - 1] as Caption)) ||
    (captions[bestCut - 1] as Caption).text.trim() === ""
  ) {
    bestCut--;
  }

  const firstHalf = captions.slice(0, bestCut);
  const secondHalf = captions.slice(bestCut);

  return [
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    ...cutCaptions({
      captions: firstHalf,
      boxWidth,
      maxLines,
      fontSize,
    }),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    ...cutCaptions({
      captions: secondHalf,
      boxWidth,
      maxLines,
      fontSize,
    }),
  ];
};

const cutCaptions = ({
  captions,
  boxWidth,
  maxLines,
  fontSize,
}: {
  captions: Caption[];
  boxWidth: number;
  maxLines: number;
  fontSize: number;
}): CaptionPage[] => {
  const { add } = fillTextBox({ maxBoxWidth: boxWidth, maxLines });
  let captionsFitted = 0;

  for (const caption of captions) {
    const { fontFamily, fontWeight, ...additionalStyles } = isCaptionMonospace(
      caption,
    )
      ? MONOSPACE_FONT
      : REGULAR_FONT;

    const { exceedsBox } = add({
      text: removeMonospaceTicks(caption).text,
      fontFamily: fontFamily as string,
      fontWeight: fontWeight as string,
      fontSize,
      additionalStyles,
      validateFontIsLoaded: true,
    });

    if (exceedsBox) {
      break;
    } else {
      captionsFitted++;
    }
  }

  if (captionsFitted === captions.length) {
    return [{ captions: captions }];
  }

  return balanceCaptions({
    captions: captions,
    boxWidth,
    fontSize,
    maxLines,
    captionsFitted: captionsFitted,
  });
};

export const getHorizontalPaddingForSubtitles = () => {
  return getSafeSpace("square");
};

export const layoutCaptions = ({
  captions,
  boxWidth,
  fontSize,
  maxLines,
}: {
  captions: Caption[];
  boxWidth: number;
  maxLines: number;
  fontSize: number;
}): LayoutedCaptions => {
  const segments = cutCaptions({
    captions: captions,
    boxWidth:
      boxWidth -
      getHorizontalPaddingForSubtitles() * 2 -
      getBorderWidthForSubtitles() * 2,
    maxLines,
    fontSize,
  });

  return {
    segments: segments.map((segment) => {
      return {
        ...segment,
        captions: segment.captions
          .map((caption) => {
            return splitCaptionIntoMonospaceSegments(caption);
          })
          .flat(1),
      };
    }),
  };
};
