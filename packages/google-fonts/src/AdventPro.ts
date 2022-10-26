import { loadFonts } from './base';

export const meta = {
  family: "'Advent Pro'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Advent+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'greek': 'U+0370-03FF',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mCoQfxVT4Dvddr_yOwjVmdKZZdNtI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mCoQfxVT4Dvddr_yOwjVmdJJZdNtI.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mCoQfxVT4Dvddr_yOwjVmdKpZd.woff2',
      },
      '200': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjfWMPbJ4C-s0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjfWMPb94C-s0.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjfWMPbF4Cw.woff2',
      },
      '300': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjZGPPbJ4C-s0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjZGPPb94C-s0.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjZGPPbF4Cw.woff2',
      },
      '400': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mAoQfxVT4Dvddr_yOwhTmtKI5Z.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mAoQfxVT4Dvddr_yOwhTStKI5Z.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mAoQfxVT4Dvddr_yOwhTqtKA.woff2',
      },
      '500': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjcmOPbJ4C-s0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjcmOPb94C-s0.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjcmOPbF4Cw.woff2',
      },
      '600': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjeWJPbJ4C-s0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjeWJPb94C-s0.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjeWJPbF4Cw.woff2',
      },
      '700': {
        'greek': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjYGIPbJ4C-s0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjYGIPb94C-s0.woff2',
        'latin': 'https://fonts.gstatic.com/s/adventpro/v18/V8mDoQfxVT4Dvddr_yOwjYGIPbF4Cw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
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
