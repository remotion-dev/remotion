import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans'",
  version: 'v27',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'devanagari': 'U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB',
    'greek-ext': 'U+1F00-1FFF',
    'greek': 'U+0370-03FF',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '100': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_ak6FBj.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_-k6FBj.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_qk6FBj.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_ek6FBj.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_ik6FBj.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_Sk6FBj.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_Wk6FBj.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0MIpQlx3QUlC5A4PNr4Awhc_uk6A.woff2',
      },
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyNYuyDzW0.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzpYeyDzW0.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARPQ_m87A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARGQ_m87A.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARDQ_m87A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4AROQ_m87A.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARBQ_m87A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARNQ_m87A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARMQ_m87A.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNr4ARCQ_k.woff2',
      },
      '500': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AyxYOyDzW0.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AydZ-yDzW0.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4Az5ZuyDzW0.woff2',
      },
      '800': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzlZeyDzW0.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyOzW1aPQ.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyHzW1aPQ.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyCzW1aPQ.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyPzW1aPQ.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyAzW1aPQ.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyMzW1aPQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyNzW1aPQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0TIpQlx3QUlC5A4PNr4AzBZOyDzW0.woff2',
      },
    },
    normal: {
      '100': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRPQ_m87A.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRGQ_m87A.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRDQ_m87A.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgROQ_m87A.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRBQ_m87A.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRNQ_m87A.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRMQ_m87A.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0OIpQlx3QUlC5A4PNjhgRCQ_k.woff2',
      },
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjKhVVZNyB.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjThZVZNyB.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr6DRAW_0.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr4TRAW_0.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr5DRAW_0.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr6TRAW_0.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr5jRAW_0.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr6jRAW_0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr6zRAW_0.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr5TRA.woff2',
      },
      '500': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjFhdVZNyB.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjOhBVZNyB.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjXhFVZNyB.woff2',
      },
      '800': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjQhJVZNyB.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVadyB1Wk.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVYNyB1Wk.woff2',
        'devanagari': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVZdyB1Wk.woff2',
        'greek-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVaNyB1Wk.woff2',
        'greek': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVZ9yB1Wk.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVa9yB1Wk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVatyB1Wk.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosans/v27/o-0NIpQlx3QUlC5A4PNjZhNVZNyB.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'devanagari' | 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'devanagari' | 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
