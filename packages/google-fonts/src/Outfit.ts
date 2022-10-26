import { loadFonts } from './base';

export const meta = {
  family: "'Outfit'",
  version: 'v6',
  url: 'https://fonts.googleapis.com/css2?family=Outfit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '200': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '300': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '400': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '500': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '600': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '700': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '800': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
      '900': {
        latin: 'https://fonts.gstatic.com/s/outfit/v6/QGYvz_MVcBeNP4NJtEtq.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'latin';
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
