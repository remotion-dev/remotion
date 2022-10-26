import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Kayah Li'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kayah+Li:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'kayah-li':
      'U+200C-200D, U+2010, U+25CC, U+A900-A92F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'kayah-li': 'https://fonts.gstatic.com/s/notosanskayahli/v18/B50SF61OpWTRcGrhOVJJwOMXdca6YecOz1nF.woff2',
      },
      '500': {
        'kayah-li': 'https://fonts.gstatic.com/s/notosanskayahli/v18/B50SF61OpWTRcGrhOVJJwOMXdca6YecOz1nF.woff2',
      },
      '600': {
        'kayah-li': 'https://fonts.gstatic.com/s/notosanskayahli/v18/B50SF61OpWTRcGrhOVJJwOMXdca6YecOz1nF.woff2',
      },
      '700': {
        'kayah-li': 'https://fonts.gstatic.com/s/notosanskayahli/v18/B50SF61OpWTRcGrhOVJJwOMXdca6YecOz1nF.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'kayah-li';
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
