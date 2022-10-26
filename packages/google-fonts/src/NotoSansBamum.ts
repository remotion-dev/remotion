import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Bamum'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bamum:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    bamum:
      'U+A6A0-A6FF, U+16800-16A38, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        bamum: 'https://fonts.gstatic.com/s/notosansbamum/v18/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O.woff2',
      },
      '500': {
        bamum: 'https://fonts.gstatic.com/s/notosansbamum/v18/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O.woff2',
      },
      '600': {
        bamum: 'https://fonts.gstatic.com/s/notosansbamum/v18/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O.woff2',
      },
      '700': {
        bamum: 'https://fonts.gstatic.com/s/notosansbamum/v18/uk-7EGK3o6EruUbnwovcbBTkkklgoq5O.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'bamum';
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
