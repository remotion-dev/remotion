import { loadFonts } from './base';

export const meta = {
  family: "'Noto Serif Gujarati'",
  version: 'v21',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    'gujarati': 'U+0964-0965, U+0A80-0AFF, U+200C-200D, U+20B9, U+25CC, U+A830-A839',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '200': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '300': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '400': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '500': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '600': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '700': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '800': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
      '900': {
        'gujarati': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWBRjVDOw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWAFjVDOw.woff2',
        'latin': 'https://fonts.gstatic.com/s/notoserifgujarati/v21/hESt6WBlOixO-3OJ1FTmTsmqlBRUJBVkWA9jVA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'gujarati' | 'latin' | 'latin-ext';
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
