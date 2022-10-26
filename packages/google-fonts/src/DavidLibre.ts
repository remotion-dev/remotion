import { loadFonts } from './base';

export const meta = {
  family: "'David Libre'",
  version: 'v12',
  url: 'https://fonts.googleapis.com/css2?family=David+Libre:ital,wght@0,400;0,500;0,700',
  unicodeRanges: {
    'hebrew': 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'hebrew': 'https://fonts.gstatic.com/s/davidlibre/v12/snfus0W_99N64iuYSvp4W8l54J-jYQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/davidlibre/v12/snfus0W_99N64iuYSvp4W8l04J-jYQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/davidlibre/v12/snfus0W_99N64iuYSvp4W8l14J-jYQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/davidlibre/v12/snfus0W_99N64iuYSvp4W8l74J8.woff2',
      },
      '500': {
        'hebrew': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8GIw4qeQDKhSg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8GIw4qTQDKhSg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8GIw4qSQDKhSg.woff2',
        'latin': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8GIw4qcQDI.woff2',
      },
      '700': {
        'hebrew': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8HAxYqeQDKhSg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8HAxYqTQDKhSg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8HAxYqSQDKhSg.woff2',
        'latin': 'https://fonts.gstatic.com/s/davidlibre/v12/snfzs0W_99N64iuYSvp4W8HAxYqcQDI.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '700';
    subsets: 'hebrew' | 'latin' | 'latin-ext' | 'vietnamese';
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
