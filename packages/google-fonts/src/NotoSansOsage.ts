import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Osage'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Osage:ital,wght@0,400',
  unicodeRanges: {
    osage:
      'U+0301, U+0304, U+030B, U+0358, U+25CC, U+104B0-104FF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        osage: 'https://fonts.gstatic.com/s/notosansosage/v15/oPWX_kB6kP4jCuhpgEGmw4mtAVtnyn22yw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'osage';
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
