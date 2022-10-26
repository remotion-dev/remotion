import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Hatran'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hatran:ital,wght@0,400',
  unicodeRanges: {
    hatran:
      'U+200C, U+108E0-108FF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        hatran: 'https://fonts.gstatic.com/s/notosanshatran/v15/A2BBn4Ne0RgnVF3Lnko-0sOBIfL_qFQci1Q.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'hatran';
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
