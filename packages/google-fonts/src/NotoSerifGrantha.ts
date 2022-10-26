import { loadFonts } from './base';

export const meta = {
  family: "'Noto Serif Grantha'",
  version: 'v19',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Grantha:ital,wght@0,400',
  unicodeRanges: {
    'grantha': 'U+0951-0952, U+0964-0965, U+0BAA, U+0BB5, U+0BE6-0BF2, U+1CD0, U+1CD2-1CD3, U+1CF2-1CF4, U+1CF8-1CF9, U+200C-200D, U+20F0, U+25CC, U+11300-1137F',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'grantha': 'https://fonts.gstatic.com/s/notoserifgrantha/v19/qkBIXuEH5NzDDvc3fLDYxPk9-Wq3WLialGhvSo7e.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgrantha/v19/qkBIXuEH5NzDDvc3fLDYxPk9-Wq3WLiaHUlKd7c.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgrantha/v19/qkBIXuEH5NzDDvc3fLDYxPk9-Wq3WLiaE0lK.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'grantha' | 'latin' | 'latin-ext';
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
