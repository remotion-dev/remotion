import { loadFonts } from './base';

export const meta = {
  family: "'Noto Music'",
  version: 'v14',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Music:ital,wght@0,400',
  unicodeRanges: {
    music:
      'U+25CC, U+2669-266F, U+1D000-1D0F5, U+1D100-1D126, U+1D129-1D1E8, U+1D200-1D245, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        music: 'https://fonts.gstatic.com/s/notomusic/v14/pe0rMIiSN5pO63htf1sxEkW7I9s.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'music';
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
