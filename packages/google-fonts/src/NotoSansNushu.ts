import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Nushu'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Nushu:ital,wght@0,400',
  unicodeRanges: {
    nushu:
      'U+2003, U+3000, U+3002, U+4E00, U+FE12, U+16FE1, U+1B170-1B2FB, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        nushu: 'https://fonts.gstatic.com/s/notosansnushu/v18/rnCw-xRQ3B7652emAbAe_Ai1IYa1IFoN.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'nushu';
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
