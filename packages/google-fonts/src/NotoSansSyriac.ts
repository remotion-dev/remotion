import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Syriac'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Syriac:ital,wght@0,100;0,400;0,900',
  unicodeRanges: {
    syriac:
      'U+0303-0304, U+0307-0308, U+030A, U+0320, U+0323-0325, U+032D-032E, U+0330-0331, U+060C, U+061B, U+061F, U+0621, U+0640, U+064B-0655, U+0660-066C, U+0670, U+0700-074F, U+200C-200F, U+25CC, U+2670-2671, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        syriac: 'https://fonts.gstatic.com/s/notosanssyriac/v15/KtkwAKuMeZjqPnXgyqribqzQqgW0D-eNKa5F.woff2',
      },
      '400': {
        syriac: 'https://fonts.gstatic.com/s/notosanssyriac/v15/Ktk2AKuMeZjqPnXgyqribqzQqgW0B_e9WA.woff2',
      },
      '900': {
        syriac: 'https://fonts.gstatic.com/s/notosanssyriac/v15/KtkxAKuMeZjqPnXgyqribqzQqgW0DweaTfpg4w.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '400' | '900';
    subsets: 'syriac';
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
