import { Font } from "./google-fonts";

export type FontInfo = {
  fontFamily: string;
  importName: string;
  version: string;
  url: string;
  unicodeRanges: Record<string, string>;
  fonts: Record<string, Record<string, Record<string, string>>>;
};

export const unqoute = (str: string) =>
  str.replace(/^['"]/g, "").replace(/['"]$/g, "");

export const quote = (str: string) => `'${str}'`;

export const removeWhitespace = (str: string) => str.replace(/\s/g, "");

export const getCssLink = (font: Font) => {
  let url = "https://fonts.googleapis.com/css2?family=";
  url += font.family.replace(/ /g, "+");
  url += ":ital,wght@";

  let weight,
    tupleList = [];
  for (const variant of font.variants) {
    weight = variant.match(/^(regular|italic)$/)
      ? "400"
      : variant.replace(/italic/g, "");
    tupleList.push(`${Number(variant.endsWith("italic"))},${weight}`);
  }

  url += tupleList.sort().join(";");

  return url;
};
