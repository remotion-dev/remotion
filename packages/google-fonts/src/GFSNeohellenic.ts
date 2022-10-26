import { loadFonts } from './base';

export const meta = {
  family: "'GFS Neohellenic'",
  version: 'v25',
  url: 'https://fonts.googleapis.com/css2?family=GFS+Neohellenic:ital,wght@0,400;0,700;1,400;1,700',
  unicodeRanges: {
    greek:
      'U+0370-03FF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '400': {
        greek: 'https://fonts.gstatic.com/s/gfsneohellenic/v25/8QITdiDOrfiq0b7R8O1Iw9WLcY5jL5JPy6E.woff2',
      },
      '700': {
        greek: 'https://fonts.gstatic.com/s/gfsneohellenic/v25/8QIWdiDOrfiq0b7R8O1Iw9WLcY5jL5r37rQfcsA.woff2',
      },
    },
    normal: {
      '400': {
        greek: 'https://fonts.gstatic.com/s/gfsneohellenic/v25/8QIRdiDOrfiq0b7R8O1Iw9WLcY5jKaJO.woff2',
      },
      '700': {
        greek: 'https://fonts.gstatic.com/s/gfsneohellenic/v25/8QIUdiDOrfiq0b7R8O1Iw9WLcY5rkYdb74Qe.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '400' | '700';
    subsets: 'greek';
  };
  normal: {
    weights: '400' | '700';
    subsets: 'greek';
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
