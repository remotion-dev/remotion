import { loadFonts } from './base';

export const meta = {
  family: "'Play'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Play:ital,wght@0,400;0,700',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'greek': 'U+0370-03FF',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/play/v17/6aez4K2oVqwIvtg2H68T.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/play/v17/6aez4K2oVqwIvtE2H68T.woff2',
        'greek': 'https://fonts.gstatic.com/s/play/v17/6aez4K2oVqwIvtY2H68T.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/play/v17/6aez4K2oVqwIvto2H68T.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/play/v17/6aez4K2oVqwIvts2H68T.woff2',
        'latin': 'https://fonts.gstatic.com/s/play/v17/6aez4K2oVqwIvtU2Hw.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/play/v17/6ae84K2oVqwItm4TCp0y2knT.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/play/v17/6ae84K2oVqwItm4TCpQy2knT.woff2',
        'greek': 'https://fonts.gstatic.com/s/play/v17/6ae84K2oVqwItm4TCpMy2knT.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/play/v17/6ae84K2oVqwItm4TCp8y2knT.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/play/v17/6ae84K2oVqwItm4TCp4y2knT.woff2',
        'latin': 'https://fonts.gstatic.com/s/play/v17/6ae84K2oVqwItm4TCpAy2g.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '700';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'greek' | 'latin' | 'latin-ext' | 'vietnamese';
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
