import { loadFonts } from './base';

export const meta = {
  family: "'Syne'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Syne:ital,wght@0,400;0,500;0,600;0,700;0,800',
  unicodeRanges: {
    'greek': 'U+0370-03FF',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'greek': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2NL9Hz_.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm25L9Hz_.woff2',
        'latin': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2BL9A.woff2',
      },
      '500': {
        'greek': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2NL9Hz_.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm25L9Hz_.woff2',
        'latin': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2BL9A.woff2',
      },
      '600': {
        'greek': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2NL9Hz_.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm25L9Hz_.woff2',
        'latin': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2BL9A.woff2',
      },
      '700': {
        'greek': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2NL9Hz_.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm25L9Hz_.woff2',
        'latin': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2BL9A.woff2',
      },
      '800': {
        'greek': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2NL9Hz_.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm25L9Hz_.woff2',
        'latin': 'https://fonts.gstatic.com/s/syne/v15/8vIH7w4qzmVxm2BL9A.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700' | '800';
    subsets: 'greek' | 'latin' | 'latin-ext';
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
