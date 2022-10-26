import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Thaana'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thaana:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    thaana:
      'U+060C, U+061B, U+061F, U+0660-066C, U+0780-07B1, U+200C-200F, U+25CC, U+FDF2, U+FDFD, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '200': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '300': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '400': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '500': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '600': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '700': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '800': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
      '900': {
        thaana: 'https://fonts.gstatic.com/s/notosansthaana/v16/C8c44dM-vnz-s-3jaEsxlxHkBH-WTs87rA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'thaana';
  };
};

export const loadFont = <T extends keyof Variants>(
  style: T,
  options: {
    weights: Variants[T]['weights'][];
    subsets: Variants[T]['subsets'][];
  }
) => {
  loadFonts(meta, style, options);
};
