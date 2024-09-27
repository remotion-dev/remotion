import { z } from "zod";
import { CalculateMetadataFunction } from "remotion";
import { getThemeColors } from "@code-hike/lighter";
import { Props } from "../Main";
import { schema } from "./schema";
import { processSnippet } from "./process-snippet";
import { getFiles } from "./get-files";
import { measureText } from "@remotion/layout-utils";
import {
  fontFamily,
  fontSize,
  horizontalPadding,
  tabSize,
  waitUntilDone,
} from "../font";
import { HighlightedCode } from "codehike/code";

export const calculateMetadata: CalculateMetadataFunction<
  Props & z.infer<typeof schema>
> = async ({ props }) => {
  const contents = await getFiles();

  await waitUntilDone();
  const widthPerCharacter = measureText({
    text: "A",
    fontFamily,
    fontSize,
    validateFontIsLoaded: true,
  }).width;

  const maxCharacters = Math.max(
    ...contents
      .map(({ value }) => value.split("\n"))
      .flat()
      .map((value) => value.replaceAll("\t", " ".repeat(tabSize)).length)
      .flat(),
  );
  const codeWidth = widthPerCharacter * maxCharacters;

  const defaultStepDuration = 90;

  const themeColors = await getThemeColors(props.theme);

  const twoSlashedCode: HighlightedCode[] = [];
  for (const snippet of contents) {
    twoSlashedCode.push(await processSnippet(snippet, props.theme));
  }

  const naturalWidth = codeWidth + horizontalPadding * 2;
  const divisibleByTwo = Math.ceil(naturalWidth / 2) * 2; // MP4 requires an even width

  const minimumWidth = props.width.type === "fixed" ? 0 : 1080;
  const minimumWidthApplied = Math.max(minimumWidth, divisibleByTwo);

  return {
    durationInFrames: contents.length * defaultStepDuration,
    width:
      props.width.type === "fixed"
        ? Math.max(minimumWidthApplied, props.width.value)
        : minimumWidthApplied,
    props: {
      theme: props.theme,
      width: props.width,
      steps: twoSlashedCode,
      themeColors,
      codeWidth,
    },
  };
};
