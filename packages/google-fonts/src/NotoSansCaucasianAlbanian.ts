import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Caucasian Albanian'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Caucasian+Albanian:ital,wght@0,400',
  unicodeRanges: {
    'caucasian-albanian':
      'U+0304, U+0331, U+25CC, U+FE20-FE2F, U+10530-1056F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'caucasian-albanian': 'https://fonts.gstatic.com/s/notosanscaucasianalbanian/v16/nKKA-HM_FYFRJvXzVXaANsU0VzsAc46QGOkWytlTs-TXnQPNhVQ.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'caucasian-albanian';
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
