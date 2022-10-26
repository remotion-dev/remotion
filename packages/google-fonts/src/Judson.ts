import { loadFonts } from './base';

export const meta = {
  family: "'Judson'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Judson:ital,wght@0,400;0,700;1,400',
  unicodeRanges: {
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '400': {
        'vietnamese': 'https://fonts.gstatic.com/s/judson/v18/FeVTS0Fbvbc14VxhDYl4_bFbkg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/judson/v18/FeVTS0Fbvbc14VxhDYl5_bFbkg.woff2',
        'latin': 'https://fonts.gstatic.com/s/judson/v18/FeVTS0Fbvbc14VxhDYl3_bE.woff2',
      },
    },
    normal: {
      '400': {
        'vietnamese': 'https://fonts.gstatic.com/s/judson/v18/FeVRS0Fbvbc14VxhB7l15bU.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/judson/v18/FeVRS0Fbvbc14VxhBrl15bU.woff2',
        'latin': 'https://fonts.gstatic.com/s/judson/v18/FeVRS0Fbvbc14VxhCLl1.woff2',
      },
      '700': {
        'vietnamese': 'https://fonts.gstatic.com/s/judson/v18/FeVSS0Fbvbc14Vxps5xg1ZRmq28.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/judson/v18/FeVSS0Fbvbc14Vxps5xg1JRmq28.woff2',
        'latin': 'https://fonts.gstatic.com/s/judson/v18/FeVSS0Fbvbc14Vxps5xg2pRm.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '400';
    subsets: 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '400' | '700';
    subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
