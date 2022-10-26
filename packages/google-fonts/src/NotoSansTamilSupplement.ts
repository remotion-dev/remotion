import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Tamil Supplement'",
  version: 'v19',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil+Supplement:ital,wght@0,400',
  unicodeRanges: {
    'tamil-supplement':
      'U+11FC0-11FFF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'tamil-supplement': 'https://fonts.gstatic.com/s/notosanstamilsupplement/v19/DdTz78kEtnooLS5rXF1DaruiCd_bFp_Ph4sGcn7ax8tqKscp.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'tamil-supplement';
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
