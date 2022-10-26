import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Indic Siyaq Numbers'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Indic+Siyaq+Numbers:ital,wght@0,400',
  unicodeRanges: {
    'indic-siyaq-numbers':
      'U+0627, U+0660-0669, U+06F0-06F9, U+1EC71-1ECB4, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'indic-siyaq-numbers': 'https://fonts.gstatic.com/s/notosansindicsiyaqnumbers/v15/6xK5dTJFKcWIu4bpRBjRZRpsIYHabOeZ8UZLubTzpXNHKy0MF85Y.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'indic-siyaq-numbers';
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
