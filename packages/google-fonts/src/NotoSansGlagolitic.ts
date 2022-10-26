import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Glagolitic'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Glagolitic:ital,wght@0,400',
  unicodeRanges: {
    glagolitic:
      'U+0303, U+0305, U+0484, U+0487, U+2C00-2C5F, U+A66F, U+1E000-1E006, U+1E008-1E018, U+1E01B-1E021, U+1E023-1E024, U+1E026-1E02A, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        glagolitic: 'https://fonts.gstatic.com/s/notosansglagolitic/v15/1q2ZY4-BBFBst88SU_tOj4J-4yuNF_HI4HTLyy2j.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'glagolitic';
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
