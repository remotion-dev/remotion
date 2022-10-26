import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Sora Sompeng'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Sora+Sompeng:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'sora-sompeng':
      'U+2010, U+110D0-110FF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'sora-sompeng': 'https://fonts.gstatic.com/s/notosanssorasompeng/v17/PlIsFkO5O6RzLfvNNVSioxM2_OTrEhPyDLolAJGE7g.woff2',
      },
      '500': {
        'sora-sompeng': 'https://fonts.gstatic.com/s/notosanssorasompeng/v17/PlIsFkO5O6RzLfvNNVSioxM2_OTrEhPyDLolAJGE7g.woff2',
      },
      '600': {
        'sora-sompeng': 'https://fonts.gstatic.com/s/notosanssorasompeng/v17/PlIsFkO5O6RzLfvNNVSioxM2_OTrEhPyDLolAJGE7g.woff2',
      },
      '700': {
        'sora-sompeng': 'https://fonts.gstatic.com/s/notosanssorasompeng/v17/PlIsFkO5O6RzLfvNNVSioxM2_OTrEhPyDLolAJGE7g.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'sora-sompeng';
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
