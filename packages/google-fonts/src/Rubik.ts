import { loadFonts } from './base';

export const meta = {
  family: "'Rubik'",
  version: 'v21',
  url: 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'hebrew': 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
      '500': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
      '800': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXO61F3f.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXq61F3f.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXy61F3f.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnXC61F3f.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWEBXyIfDnIV7nEnX661A.woff2',
      },
    },
    normal: {
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
      '500': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
      '800': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nMrXyi0A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nFrXyi0A.woff2',
        'hebrew': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nDrXyi0A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nPrXyi0A.woff2',
        'latin': 'https://fonts.gstatic.com/s/rubik/v21/iJWKBXyIfDnIV7nBrXw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'hebrew' | 'latin' | 'latin-ext';
  };
  normal: {
    weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'hebrew' | 'latin' | 'latin-ext';
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
