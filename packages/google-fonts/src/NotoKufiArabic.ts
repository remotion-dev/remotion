import { loadFonts } from './base';

export const meta = {
  family: "'Noto Kufi Arabic'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    arabic:
      'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '200': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '300': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '400': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '500': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '600': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '700': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '800': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
      '900': {
        arabic: 'https://fonts.gstatic.com/s/notokufiarabic/v15/CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFg.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'arabic';
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
