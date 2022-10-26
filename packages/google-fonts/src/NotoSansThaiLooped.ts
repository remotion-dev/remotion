import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Thai Looped'",
  version: 'v12',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai+Looped:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    thai: 'U+0E01-0E5B, U+200C-200D, U+25CC, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50fF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3YX5ALciU.woff2',
      },
      '200': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Y84EIQQDy.woff2',
      },
      '300': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Yl4IIQQDy.woff2',
      },
      '400': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50RF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3QKKAd.woff2',
      },
      '500': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Yz4MIQQDy.woff2',
      },
      '600': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Y44QIQQDy.woff2',
      },
      '700': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Yh4UIQQDy.woff2',
      },
      '800': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Ym4YIQQDy.woff2',
      },
      '900': {
        thai: 'https://fonts.gstatic.com/s/notosansthailooped/v12/B50cF6pOpWTRcGrhOVJJ3-oPfY7WQuFu5R3Yv4cIQQDy.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'thai';
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
