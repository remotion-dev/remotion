import { loadFonts } from './base';

export const meta = {
  family: "'Bellota Text'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Bellota+Text:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
  unicodeRanges: {
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '300': {
        'cyrillic': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--Gmfz_3ayqSxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--Gmfz_8ayqSxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--Gmfz_9ayqSxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--Gmfz_zayo.woff2',
      },
      '400': {
        'cyrillic': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlNVP2VnlWS4f3-UE9hHXMx--kJXSrMSg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlNVP2VnlWS4f3-UE9hHXMx--kCXSrMSg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlNVP2VnlWS4f3-UE9hHXMx--kDXSrMSg.woff2',
        'latin': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlNVP2VnlWS4f3-UE9hHXMx--kNXSo.woff2',
      },
      '700': {
        'cyrillic': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--G2eD_3ayqSxg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--G2eD_8ayqSxg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--G2eD_9ayqSxg.woff2',
        'latin': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlOVP2VnlWS4f3-UE9hHXMx--G2eD_zayo.woff2',
      },
    },
    normal: {
      '300': {
        'cyrillic': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5Vfsafg_xcy4.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5VfsadQ_xcy4.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5VfsadA_xcy4.woff2',
        'latin': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5Vfsaeg_x.woff2',
      },
      '400': {
        'cyrillic': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlTVP2VnlWS4f3-UE9hHXMx-tkPRS4.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlTVP2VnlWS4f3-UE9hHXMx8dkPRS4.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlTVP2VnlWS4f3-UE9hHXMx8NkPRS4.woff2',
        'latin': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlTVP2VnlWS4f3-UE9hHXMx_tkP.woff2',
      },
      '700': {
        'cyrillic': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5Rfwafg_xcy4.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5RfwadQ_xcy4.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5RfwadA_xcy4.woff2',
        'latin': 'https://fonts.gstatic.com/s/bellotatext/v16/0FlMVP2VnlWS4f3-UE9hHXM5Rfwaeg_x.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '300' | '400' | '700';
    subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '300' | '400' | '700';
    subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
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
