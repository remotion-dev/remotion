import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Manichaean'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Manichaean:ital,wght@0,400',
  unicodeRanges: {
    manichaean:
      'U+0640, U+200C-200D, U+25CC, U+FE00, U+10AC0-10AFF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        manichaean: 'https://fonts.gstatic.com/s/notosansmanichaean/v15/taiVGntiC4--qtsfi4Jp9-_GkPZZCcrfenr-Pzo.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'manichaean';
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
