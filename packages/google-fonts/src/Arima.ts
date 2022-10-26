import { loadFonts } from './base';

export const meta = {
  family: "'Arima'",
  version: 'v1',
  url: 'https://fonts.googleapis.com/css2?family=Arima:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'greek-ext': 'U+1F00-1FFF',
    'greek': 'U+0370-03FF',
    'malayalam': 'U+0307, U+0323, U+0964-0965, U+0D02-0D7F, U+200C-200D, U+20B9, U+25CC',
    'tamil': 'U+0964-0965, U+0B82-0BFA, U+200C-200D, U+20B9, U+25CC',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
      '200': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
      '300': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
      '400': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
      '500': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
      '600': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
      '700': {
        'greek-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CE_oC-Nw.woff2',
        'greek': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CL_oC-Nw.woff2',
        'malayalam': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CQ_oC-Nw.woff2',
        'tamil': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9Ce_oC-Nw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CH_oC-Nw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CG_oC-Nw.woff2',
        'latin': 'https://fonts.gstatic.com/s/arima/v1/neIFzCqmt4Aup9CI_oA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
    subsets: 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'malayalam' | 'tamil' | 'vietnamese';
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
