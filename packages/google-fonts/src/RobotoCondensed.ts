import { loadFonts } from './base';

export const meta = {
  family: "'Roboto Condensed'",
  version: 'v25',
  url: 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'greek-ext': 'U+1F00-1FFF',
    'greek': 'U+0370-03FF',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEoYNNZQyQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEoadNZQyQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEoYdNZQyQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEobtNZQyQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEoYtNZQyQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEoY9NZQyQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDpCEobdNZ.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLAgM9UvI.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLCwM9UvI.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLAwM9UvI.woff2',
        'greek': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLDAM9UvI.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLAAM9UvI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLAQM9UvI.woff2',
        'latin': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVj2ZhZI2eCN5jzbjEETS9weq8-19eLDwM9.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYoYNNZQyQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYoadNZQyQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYoYdNZQyQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYobtNZQyQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYoYtNZQyQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYoY9NZQyQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVg2ZhZI2eCN5jzbjEETS9weq8-19eDtCYobdNZ.woff2',
      },
    },
    normal: {
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCkYb8td.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCAYb8td.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCgYb8td.woff2',
        'greek': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCcYb8td.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCsYb8td.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCoYb8td.woff2',
        'latin': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-33mZGCQYbw.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-19-7DRs5.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-19a7DRs5.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-1967DRs5.woff2',
        'greek': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-19G7DRs5.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-1927DRs5.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-19y7DRs5.woff2',
        'latin': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVl2ZhZI2eCN5jzbjEETS9weq8-19K7DQ.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCkYb8td.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCAYb8td.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCgYb8td.woff2',
        'greek': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCcYb8td.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCsYb8td.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCoYb8td.woff2',
        'latin': 'https://fonts.gstatic.com/s/robotocondensed/v25/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCQYbw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '300' | '400' | '700';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '300' | '400' | '700';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
