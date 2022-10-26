import { loadFonts } from './base';

export const meta = {
  family: "'Galada'",
  version: 'v14',
  url: 'https://fonts.googleapis.com/css2?family=Galada:ital,wght@0,400',
  unicodeRanges: {
    bengali: 'U+0964-0965, U+0981-09FB, U+200C-200D, U+20B9, U+25CC',
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        bengali: 'https://fonts.gstatic.com/s/galada/v14/H4cmBXyGmcjXlUXO5yY_0Lo.woff2',
        latin: 'https://fonts.gstatic.com/s/galada/v14/H4cmBXyGmcjXlUXO9SY_.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'bengali' | 'latin';
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
