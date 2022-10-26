import { loadFonts } from './base';

export const meta = {
  family: "'Lateef'",
  version: 'v24',
  url: 'https://fonts.googleapis.com/css2?family=Lateef:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800',
  unicodeRanges: {
    'arabic': 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '200': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0bjyQbK7axnQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0bjyQZ67axnQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0bjyQaa7a.woff2',
      },
      '300': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0Cj-QbK7axnQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0Cj-QZ67axnQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0Cj-Qaa7a.woff2',
      },
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESw6XVnNCxEvkb8pB2FVo8.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESw6XVnNCxEvkb8rx2FVo8.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESw6XVnNCxEvkb8oR2F.woff2',
      },
      '500': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0Uj6QbK7axnQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0Uj6QZ67axnQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0Uj6Qaa7a.woff2',
      },
      '600': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0fjmQbK7axnQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0fjmQZ67axnQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0fjmQaa7a.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0GjiQbK7axnQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0GjiQZ67axnQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0GjiQaa7a.woff2',
      },
      '800': {
        'arabic': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0BjuQbK7axnQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0BjuQZ67axnQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/lateef/v24/hESz6XVnNCxEvkb0BjuQaa7a.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
    subsets: 'arabic' | 'latin' | 'latin-ext';
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
