import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Hanifi Rohingya'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hanifi+Rohingya:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'hanifi-rohingya':
      'U+060C, U+061B, U+061F, U+0640, U+0660, U+06D4, U+200C-200D, U+25CC, U+10D00-10D3F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'hanifi-rohingya': 'https://fonts.gstatic.com/s/notosanshanifirohingya/v18/5h1IiYsoOmIC3Yu3MDXLDw3UZCgghyOEBBY7hhLN4OnFeA.woff2',
      },
      '500': {
        'hanifi-rohingya': 'https://fonts.gstatic.com/s/notosanshanifirohingya/v18/5h1IiYsoOmIC3Yu3MDXLDw3UZCgghyOEBBY7hhLN4OnFeA.woff2',
      },
      '600': {
        'hanifi-rohingya': 'https://fonts.gstatic.com/s/notosanshanifirohingya/v18/5h1IiYsoOmIC3Yu3MDXLDw3UZCgghyOEBBY7hhLN4OnFeA.woff2',
      },
      '700': {
        'hanifi-rohingya': 'https://fonts.gstatic.com/s/notosanshanifirohingya/v18/5h1IiYsoOmIC3Yu3MDXLDw3UZCgghyOEBBY7hhLN4OnFeA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'hanifi-rohingya';
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
