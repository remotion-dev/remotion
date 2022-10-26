import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Cuneiform'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Cuneiform:ital,wght@0,400',
  unicodeRanges: {
    cuneiform:
      'U+12000-123FF, U+12400-1246E, U+12470-12474, U+12480-12543, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        cuneiform: 'https://fonts.gstatic.com/s/notosanscuneiform/v15/bMrrmTWK7YY-MF22aHGGd7H8PhJtvBDWse5DlA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'cuneiform';
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
