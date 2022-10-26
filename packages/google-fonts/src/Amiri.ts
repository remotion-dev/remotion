import { loadFonts } from './base';

export const meta = {
  family: "'Amiri'",
  version: 'v24',
  url: 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700',
  unicodeRanges: {
    'arabic': 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/amiri/v24/J7afnpd8CGxBHpUrhLQY66NL.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/amiri/v24/J7afnpd8CGxBHpUrhL8Y66NL.woff2',
        'latin': 'https://fonts.gstatic.com/s/amiri/v24/J7afnpd8CGxBHpUrhLEY6w.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/amiri/v24/J7aanpd8CGxBHpUrjAo9_plqHwAa.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/amiri/v24/J7aanpd8CGxBHpUrjAo9_pJqHwAa.woff2',
        'latin': 'https://fonts.gstatic.com/s/amiri/v24/J7aanpd8CGxBHpUrjAo9_pxqHw.woff2',
      },
    },
    normal: {
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/amiri/v24/J7aRnpd8CGxBHpUrtLMA7w.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/amiri/v24/J7aRnpd8CGxBHpUgtLMA7w.woff2',
        'latin': 'https://fonts.gstatic.com/s/amiri/v24/J7aRnpd8CGxBHpUutLM.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/amiri/v24/J7acnpd8CGxBHp2VkaY6zp5yGw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/amiri/v24/J7acnpd8CGxBHp2VkaYxzp5yGw.woff2',
        'latin': 'https://fonts.gstatic.com/s/amiri/v24/J7acnpd8CGxBHp2VkaY_zp4.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '400' | '700';
    subsets: 'arabic' | 'latin' | 'latin-ext';
  };
  normal: {
    weights: '400' | '700';
    subsets: 'arabic' | 'latin' | 'latin-ext';
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
