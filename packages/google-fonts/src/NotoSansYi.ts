import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Yi'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Yi:ital,wght@0,400',
  unicodeRanges: {
    yi: 'U+3001-3002, U+3008-3011, U+3014-301B, U+30FB, U+A000-A48C, U+A490-A4C6, U+FF01, U+FF0C, U+FF1A-FF1B, U+FF1F, U+FF61-FF65, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        yi: 'https://fonts.gstatic.com/s/notosansyi/v16/sJoD3LFXjsSdcnzn071rO3aZ41rI.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'yi';
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
