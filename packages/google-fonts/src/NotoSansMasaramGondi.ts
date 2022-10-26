import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Masaram Gondi'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Masaram+Gondi:ital,wght@0,400',
  unicodeRanges: {
    'masaram-gondi':
      'U+0964-0965, U+25CC, U+11D00-11D5F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'masaram-gondi': 'https://fonts.gstatic.com/s/notosansmasaramgondi/v15/6xK_dThFKcWIu4bpRBjRYRV7KZCbUq6n_1kPntH65xM.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'masaram-gondi';
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
