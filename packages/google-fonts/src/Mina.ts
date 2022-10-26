import { loadFonts } from './base';

export const meta = {
  family: "'Mina'",
  version: 'v11',
  url: 'https://fonts.googleapis.com/css2?family=Mina:ital,wght@0,400;0,700',
  unicodeRanges: {
    'bengali': 'U+0964-0965, U+0981-09FB, U+200C-200D, U+20B9, U+25CC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'bengali': 'https://fonts.gstatic.com/s/mina/v11/-nFzOGc18vARnypp7x3y.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/mina/v11/-nFzOGc18vARnzZp7x3y.woff2',
        'latin': 'https://fonts.gstatic.com/s/mina/v11/-nFzOGc18vARnzhp7w.woff2',
      },
      '700': {
        'bengali': 'https://fonts.gstatic.com/s/mina/v11/-nF8OGc18vARl4NM-jDT9qOk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/mina/v11/-nF8OGc18vARl4NM-izT9qOk.woff2',
        'latin': 'https://fonts.gstatic.com/s/mina/v11/-nF8OGc18vARl4NM-iLT9g.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '700';
    subsets: 'bengali' | 'latin' | 'latin-ext';
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
