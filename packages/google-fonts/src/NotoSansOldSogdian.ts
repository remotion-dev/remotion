import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Old Sogdian'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Old+Sogdian:ital,wght@0,400',
  unicodeRanges: {
    'old-sogdian':
      'U+10F00-10F27, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'old-sogdian': 'https://fonts.gstatic.com/s/notosansoldsogdian/v15/3JnjSCH90Gmq2mrzckOBBhFhdrMst48aURtLEMkOPg.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'old-sogdian';
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
