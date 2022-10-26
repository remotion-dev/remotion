import { loadFonts } from './base';

export const meta = {
  family: "'Aleo'",
  version: 'v11',
  url: 'https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
  unicodeRanges: {
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '300': {
        'latin-ext': 'https://fonts.gstatic.com/s/aleo/v11/c4mi1nF8G8_swAjxeDd5k6d4xKM.woff2',
        'latin': 'https://fonts.gstatic.com/s/aleo/v11/c4mi1nF8G8_swAjxeDd5nad4.woff2',
      },
      '400': {
        'latin-ext': 'https://fonts.gstatic.com/s/aleo/v11/c4mh1nF8G8_swAj53RVsooY.woff2',
        'latin': 'https://fonts.gstatic.com/s/aleo/v11/c4mh1nF8G8_swAj50xVs.woff2',
      },
      '700': {
        'latin-ext': 'https://fonts.gstatic.com/s/aleo/v11/c4mi1nF8G8_swAjxaDB5k6d4xKM.woff2',
        'latin': 'https://fonts.gstatic.com/s/aleo/v11/c4mi1nF8G8_swAjxaDB5nad4.woff2',
      },
    },
    normal: {
      '300': {
        'latin-ext': 'https://fonts.gstatic.com/s/aleo/v11/c4mg1nF8G8_syKbrxDxJn798.woff2',
        'latin': 'https://fonts.gstatic.com/s/aleo/v11/c4mg1nF8G8_syKbrxDJJnw.woff2',
      },
      '400': {
        'latin-ext': 'https://fonts.gstatic.com/s/aleo/v11/c4mv1nF8G8_swAPJ0Q1o.woff2',
        'latin': 'https://fonts.gstatic.com/s/aleo/v11/c4mv1nF8G8_swA3J0Q.woff2',
      },
      '700': {
        'latin-ext': 'https://fonts.gstatic.com/s/aleo/v11/c4mg1nF8G8_syLbsxDxJn798.woff2',
        'latin': 'https://fonts.gstatic.com/s/aleo/v11/c4mg1nF8G8_syLbsxDJJnw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '300' | '400' | '700';
    subsets: 'latin' | 'latin-ext';
  };
  normal: {
    weights: '300' | '400' | '700';
    subsets: 'latin' | 'latin-ext';
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
