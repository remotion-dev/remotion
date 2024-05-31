import type { Font } from "./google-fonts";

export const unquote = (str: string) =>
  str.replace(/^['"]/g, "").replace(/['"]$/g, "");

// Firefox does not support numbers in fontFamily
export const replaceDigitsWithWords = (str: string): string => {
  const numWords = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  return str.replace(/\d/g, (digit) => numWords[parseInt(digit)]);
};

export const quote = (str: string) => `'${str}'`;

export const removeWhitespace = (str: string) => str.replace(/\s/g, "");

export const getCssLink = (font: Font) => {
  let url = "https://fonts.googleapis.com/css2?family=";
  url += font.family.replace(/ /g, "+");
  url += ":ital,wght@";

  let tupleList: string[] = [];
  for (const variant of font.variants) {
    const weight = variant.match(/^(regular|italic)$/)
      ? "400"
      : variant.replace(/italic/g, "");
    tupleList.push(`${Number(variant.endsWith("italic"))},${weight}`);
  }

  url += tupleList.sort().join(";");

  return url;
};
