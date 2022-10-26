import { loadFonts } from './base';

export const meta = {
  family: "'Source Sans Pro'",
  version: 'v21',
  url: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900',
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
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSdh18Smxg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSdo18Smxg.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSdg18Smxg.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSdv18Smxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSdj18Smxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSdi18Smxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZYokSds18Q.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidh18Smxg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkido18Smxg.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidg18Smxg.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidv18Smxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidj18Smxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkidi18Smxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZMkids18Q.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7qsDJT9g.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7jsDJT9g.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7rsDJT9g.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7ksDJT9g.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7osDJT9g.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7psDJT9g.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK1dSBYKcSV-LCoeQqfX1RYOo3qPZ7nsDI.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdh18Smxg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdo18Smxg.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdg18Smxg.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdv18Smxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdj18Smxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCdi18Smxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZY4lCds18Q.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdh18Smxg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdo18Smxg.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdg18Smxg.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdv18Smxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdj18Smxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSdi18Smxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZclSds18Q.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklydh18Smxg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklydo18Smxg.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklydg18Smxg.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklydv18Smxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklydj18Smxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklydi18Smxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKwdSBYKcSV-LCoeQqfX1RYOo3qPZZklyds18Q.woff2',
      },
    },
    normal: {
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wmhduz8A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wkxduz8A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wmxduz8A.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wlBduz8A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wmBduz8A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wmRduz8A.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i94_wlxdu.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmhduz8A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwkxduz8A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmxduz8A.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlBduz8A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmBduz8A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmRduz8A.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlxdu.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNa7lqDY.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qPK7lqDY.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNK7lqDY.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qO67lqDY.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qN67lqDY.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNq7lqDY.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7l.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmhduz8A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwkxduz8A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmxduz8A.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlBduz8A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmBduz8A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmRduz8A.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlxdu.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmhduz8A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwkxduz8A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmxduz8A.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlBduz8A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmBduz8A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwmRduz8A.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlxdu.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwmhduz8A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwkxduz8A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwmxduz8A.woff2',
        'greek': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwlBduz8A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwmBduz8A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwmRduz8A.woff2',
        'latin': 'https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwlxdu.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '200' | '300' | '400' | '600' | '700' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '200' | '300' | '400' | '600' | '700' | '900';
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
