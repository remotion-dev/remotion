import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Sundanese'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sundanese:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    sundanese:
      'U+1B80-1BBF, U+1CC0-1CC7, U+200C-200D, U+2010, U+25CC, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        sundanese: 'https://fonts.gstatic.com/s/notosanssundanese/v17/FwZH7_84xUkosG2xJo2gm7nFwSLQkdymgViMPg.woff2',
      },
      '500': {
        sundanese: 'https://fonts.gstatic.com/s/notosanssundanese/v17/FwZH7_84xUkosG2xJo2gm7nFwSLQkdymgViMPg.woff2',
      },
      '600': {
        sundanese: 'https://fonts.gstatic.com/s/notosanssundanese/v17/FwZH7_84xUkosG2xJo2gm7nFwSLQkdymgViMPg.woff2',
      },
      '700': {
        sundanese: 'https://fonts.gstatic.com/s/notosanssundanese/v17/FwZH7_84xUkosG2xJo2gm7nFwSLQkdymgViMPg.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'sundanese';
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
