import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Tifinagh'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tifinagh:ital,wght@0,400',
  unicodeRanges: {
    tifinagh:
      'U+02C7, U+0301-0302, U+0304, U+0306-0307, U+0309, U+0323, U+0331, U+200C-200D, U+202E, U+25CC, U+2D30-2D7F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        tifinagh: 'https://fonts.gstatic.com/s/notosanstifinagh/v15/I_uzMoCduATTei9eI8dawkHIwvmhCvbXzbPF.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'tifinagh';
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
