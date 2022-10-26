import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Mongolian'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian:ital,wght@0,400',
  unicodeRanges: {
    mongolian:
      'U+1800-18AF, U+200C-200D, U+202F, U+2048-2049, U+2460-2473, U+25CC, U+3001-3002, U+300A-300F, U+FE3D-FE3E, U+FE41-FE44, U+11660-1166C, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        mongolian: 'https://fonts.gstatic.com/s/notosansmongolian/v15/VdGCAYADGIwE0EopZx8xQfHlgEAMsrTo9Jcq6g.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'mongolian';
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
