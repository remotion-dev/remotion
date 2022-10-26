import { loadFonts } from './base';

export const meta = {
  family: "'Gabriela'",
  version: 'v14',
  url: 'https://fonts.googleapis.com/css2?family=Gabriela:ital,wght@0,400',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/gabriela/v14/qkBWXvsO6sreR8E-b8m0xLt3mQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/gabriela/v14/qkBWXvsO6sreR8E-b8m9xLt3mQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/gabriela/v14/qkBWXvsO6sreR8E-b8m5xLs.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'latin';
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
