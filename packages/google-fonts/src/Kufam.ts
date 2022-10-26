import { loadFonts } from './base';

export const meta = {
  family: "'Kufam'",
  version: 'v20',
  url: 'https://fonts.googleapis.com/css2?family=Kufam:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900',
  unicodeRanges: {
    'arabic': 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjoxxkGE.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjAxxkGE.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjExxkGE.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFj8xxg.woff2',
      },
      '500': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjoxxkGE.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjAxxkGE.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjExxkGE.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFj8xxg.woff2',
      },
      '600': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjoxxkGE.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjAxxkGE.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjExxkGE.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFj8xxg.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjoxxkGE.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjAxxkGE.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjExxkGE.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFj8xxg.woff2',
      },
      '800': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjoxxkGE.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjAxxkGE.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjExxkGE.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFj8xxg.woff2',
      },
      '900': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjoxxkGE.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjAxxkGE.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFjExxkGE.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8cj4cY7pG7w_q6AFj8xxg.woff2',
      },
    },
    normal: {
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6AJj0pwg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6KJj0pwg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6LJj0pwg.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6FJj0.woff2',
      },
      '500': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6AJj0pwg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6KJj0pwg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6LJj0pwg.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6FJj0.woff2',
      },
      '600': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6AJj0pwg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6KJj0pwg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6LJj0pwg.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6FJj0.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6AJj0pwg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6KJj0pwg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6LJj0pwg.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6FJj0.woff2',
      },
      '800': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6AJj0pwg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6KJj0pwg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6LJj0pwg.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6FJj0.woff2',
      },
      '900': {
        'arabic': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6AJj0pwg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6KJj0pwg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6LJj0pwg.woff2',
        'latin': 'https://fonts.gstatic.com/s/kufam/v20/C8ct4cY7pG7w_q6FJj0.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'arabic' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'arabic' | 'latin' | 'latin-ext' | 'vietnamese';
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
