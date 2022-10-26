import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Old Permic'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Old+Permic:ital,wght@0,400',
  unicodeRanges: {
    'old-permic':
      'U+0300, U+0306-0308, U+0313, U+0483, U+20DB, U+25CC, U+10350-1037A, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'old-permic': 'https://fonts.gstatic.com/s/notosansoldpermic/v16/snf1s1q1-dF8pli1TesqcbUY4Mr-ElrwKIc8iP4.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'old-permic';
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
