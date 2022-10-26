import { loadFonts } from './base';

export const meta = {
  family: "'Noto Serif Tangut'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Tangut:ital,wght@0,400',
  unicodeRanges: {
    tangut:
      'U+16FE0, U+17000-187F7, U+18800-18AF2, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        tangut: 'https://fonts.gstatic.com/s/notoseriftangut/v15/xn76YGc72GKoTvER4Gn3b4m9Ern7El6wVu_A.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'tangut';
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
