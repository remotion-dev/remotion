import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans N Ko'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+N+Ko:ital,wght@0,400',
  unicodeRanges: {
    nko: 'U+060C, U+061B, U+061F, U+066A, U+07C0-07FF, U+200C-200F, U+25CC, U+2E1C-2E1D, U+FD3E-FD3F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        nko: 'https://fonts.gstatic.com/s/notosansnko/v17/6NUP8FqDKBaKKjnr6P8v-sxPpsUtXtg.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'nko';
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
