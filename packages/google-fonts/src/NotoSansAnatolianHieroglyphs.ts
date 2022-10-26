import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Anatolian Hieroglyphs'",
  version: 'v14',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Anatolian+Hieroglyphs:ital,wght@0,400',
  unicodeRanges: {
    'anatolian-hieroglyphs':
      'U+14400-14646, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'anatolian-hieroglyphs': 'https://fonts.gstatic.com/s/notosansanatolianhieroglyphs/v14/ijw9s4roRME5LLRxjsRb8A0gKPSWq4BbDmHHu6j2pEtUJzZWb4bj7mo.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'anatolian-hieroglyphs';
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
