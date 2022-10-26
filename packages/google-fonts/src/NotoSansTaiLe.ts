import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Tai Le'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tai+Le:ital,wght@0,400',
  unicodeRanges: {
    'tai-le':
      'U+0300-0301, U+0307-0308, U+030C, U+1040-1049, U+1950-197F, U+200C-200D, U+25CC, U+3001-3002, U+3008-300B, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'tai-le': 'https://fonts.gstatic.com/s/notosanstaile/v15/vEFK2-VODB8RrNDvZSUmVxEATwR5wpm_Wg.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'tai-le';
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
