import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Meroitic'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Meroitic:ital,wght@0,400',
  unicodeRanges: {
    meroitic:
      'U+205D, U+10980-109B7, U+109BC-109CF, U+109D2-109FF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        meroitic: 'https://fonts.gstatic.com/s/notosansmeroitic/v16/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00Uz7jJS.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'meroitic';
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
