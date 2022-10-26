import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Tai Tham'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tai+Tham:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'tai-tham':
      'U+1A20-1AAF, U+200C-200D, U+2219, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'tai-tham': 'https://fonts.gstatic.com/s/notosanstaitham/v17/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5k.woff2',
      },
      '500': {
        'tai-tham': 'https://fonts.gstatic.com/s/notosanstaitham/v17/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5k.woff2',
      },
      '600': {
        'tai-tham': 'https://fonts.gstatic.com/s/notosanstaitham/v17/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5k.woff2',
      },
      '700': {
        'tai-tham': 'https://fonts.gstatic.com/s/notosanstaitham/v17/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5k.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'tai-tham';
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
