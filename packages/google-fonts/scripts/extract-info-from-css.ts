import { unquote } from "./utils";

const getValue = (line: string) => {
  const name = line.match(/\:(.*)\;/)?.[1].trim();
  return unquote(name as string);
};

const getUrl = (line: string) => {
  const name = line.match(/url\((.*?)\)/)?.[1].trim();
  return name;
};

const parseFontFace = (block: string) => {
  const lines = block.split("\n");

  const subset = (lines.find((line) => line.trim().startsWith("/*")) as string)
    .match(/\/\*(.*)\*\//)![1]
    .trim();
  const fontFamily = getValue(
    lines.find((line) => line.trim().startsWith("font-family")) as string
  );
  const src = getUrl(
    lines.find((line) => line.trim().startsWith("src")) as string
  );
  const unicodeRange = getValue(
    lines.find((line) => line.trim().startsWith("unicode-range")) as string
  );
  const weight = getValue(
    lines.find((line) => line.trim().startsWith("font-weight")) as string
  );
  const style = getValue(
    lines.find((line) => line.trim().startsWith("font-style")) as string
  );

  if (!weight) throw Error("no weight");
  if (!subset) throw Error("no subset");
  if (!unicodeRange) throw Error("no unicodeRange");
  if (!src) throw Error("no src");

  return { fontFamily, src, unicodeRange, weight, style, subset };
};

export type FontInfo = {
  fontFamily: string;
  importName: string;
  version: string;
  url: string;
  unicodeRanges: Record<string, string>;
  fonts: Record<string, Record<string, Record<string, string>>>;
};

export const extractInfoFromCss = ({
  contents,
  fontFamily,
  importName,
  url,
  version,
}: {
  contents: string;
  fontFamily: string;
  importName: string;
  url: string;
  version: string;
}): FontInfo => {
  let remainingContents = contents;

  let unicodeRanges: Record<string, string> = {};
  let fonts: Record<string, Record<string, Record<string, string>>> = {};

  while (remainingContents.match(/\/\*(.*)/)) {
    const startIndex = remainingContents.indexOf("/*");
    const endIndex = remainingContents.substring(startIndex + 2).indexOf("/*");
    const extractedContents = remainingContents.substring(
      startIndex,
      endIndex === -1 ? Infinity : endIndex + 2
    );
    remainingContents = remainingContents.substring(endIndex + 2);
    const { subset, unicodeRange, style, src, weight } =
      parseFontFace(extractedContents);

    unicodeRanges[subset] = unicodeRange;
    fonts[style] ??= {};
    fonts[style][weight] ??= {};
    fonts[style][weight][subset] = src;

    if (endIndex === -1) {
      break;
    }
  }

  // Prepare info data
  const info: FontInfo = {
    fontFamily,
    importName,
    version,
    url,
    unicodeRanges,
    fonts,
  };
  return info;
};
