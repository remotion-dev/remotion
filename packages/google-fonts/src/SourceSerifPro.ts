import { loadFonts } from './base';

export const meta = {
  family: "'Source Serif Pro'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'greek': 'U+0370-03FF',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGbSqay60rRrI.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGbSqawq0rRrI.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGbSqaxa0rRrI.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGbSqaya0rRrI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGbSqayK0rRrI.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGbSqaxq0r.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGCSmay60rRrI.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGCSmawq0rRrI.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGCSmaxa0rRrI.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGCSmaya0rRrI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGCSmayK0rRrI.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGCSmaxq0r.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIWzD-0qpwxpaWvjeD0X88SAOeauXEOrwuP-Yw.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIWzD-0qpwxpaWvjeD0X88SAOeauXEOpguP-Yw.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIWzD-0qpwxpaWvjeD0X88SAOeauXEOoQuP-Yw.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIWzD-0qpwxpaWvjeD0X88SAOeauXEOrQuP-Yw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIWzD-0qpwxpaWvjeD0X88SAOeauXEOrAuP-Yw.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIWzD-0qpwxpaWvjeD0X88SAOeauXEOoguP.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGfS-ay60rRrI.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGfS-awq0rRrI.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGfS-axa0rRrI.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGfS-aya0rRrI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGfS-ayK0rRrI.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGfS-axq0r.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGGS6ay60rRrI.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGGS6awq0rRrI.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGGS6axa0rRrI.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGGS6aya0rRrI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGGS6ayK0rRrI.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGGS6axq0r.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGISyay60rRrI.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGISyawq0rRrI.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGISyaxa0rRrI.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGISyaya0rRrI.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGISyayK0rRrI.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIVzD-0qpwxpaWvjeD0X88SAOeauXEGISyaxq0r.woff2',
      },
    },
    normal: {
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasbsftSGqxLUv.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasbsftSiqxLUv.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasbsftS-qxLUv.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasbsftSOqxLUv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasbsftSKqxLUv.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasbsftSyqxA.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasd8ctSGqxLUv.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasd8ctSiqxLUv.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasd8ctS-qxLUv.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasd8ctSOqxLUv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasd8ctSKqxLUv.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasd8ctSyqxA.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeauXk-oBOL.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeauXA-oBOL.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeauXc-oBOL.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeauXs-oBOL.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeauXo-oBOL.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeauXQ-oA.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasasatSGqxLUv.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasasatSiqxLUv.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasasatS-qxLUv.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasasatSOqxLUv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasasatSKqxLUv.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasasatSyqxA.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasc8btSGqxLUv.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasc8btSiqxLUv.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasc8btS-qxLUv.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasc8btSOqxLUv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasc8btSKqxLUv.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasc8btSyqxA.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasfcZtSGqxLUv.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasfcZtSiqxLUv.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasfcZtS-qxLUv.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasfcZtSOqxLUv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasfcZtSKqxLUv.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIXzD-0qpwxpaWvjeD0X88SAOeasfcZtSyqxA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '200' | '300' | '400' | '600' | '700' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'greek' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '200' | '300' | '400' | '600' | '700' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'greek' | 'latin' | 'latin-ext' | 'vietnamese';
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
