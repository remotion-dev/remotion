import { loadFonts } from './base';

export const meta = {
  family: "'IM Fell French Canon'",
  version: 'v21',
  url: 'https://fonts.googleapis.com/css2?family=IM+Fell+French+Canon:ital,wght@0,400;1,400',
  unicodeRanges: {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '400': {
        latin: 'https://fonts.gstatic.com/s/imfellfrenchcanon/v21/-F6gfiNtDWYfYc-tDiyiw08rrghJszkK6foXBN5Ayg.woff2',
      },
    },
    normal: {
      '400': {
        latin: 'https://fonts.gstatic.com/s/imfellfrenchcanon/v21/-F6ufiNtDWYfYc-tDiyiw08rrghJszkK6foSNNw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '400';
    subsets: 'latin';
  };
  normal: {
    weights: '400';
    subsets: 'latin';
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
