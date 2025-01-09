import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Sans Hebrew',
	importName: 'IBMPlexSansHebrew',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		hebrew: 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa4qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEXBylcfqQaM.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa4qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEXBylgfqQaM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa4qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEXBylQfqQaM.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa4qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEXBylofqQ.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVt2001jDu19Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVt2006jDu19Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVt2002jDu19Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVt2004jDs.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUJ2E01jDu19Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUJ2E06jDu19Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUJ2E02jDu19Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUJ2E04jDs.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa2qYENg9Kw1mpLpO0bGM5lfHAAZHhDXE2v-lgHrQ.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa2qYENg9Kw1mpLpO0bGM5lfHAAZHhDXE2g-lgHrQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa2qYENg9Kw1mpLpO0bGM5lfHAAZHhDXE2s-lgHrQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa2qYENg9Kw1mpLpO0bGM5lfHAAZHhDXE2i-lg.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVR2U01jDu19Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVR2U06jDu19Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVR2U02jDu19Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEVR2U04jDs.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEV93k01jDu19Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEV93k06jDu19Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEV93k02jDu19Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEV93k04jDs.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUZ3001jDu19Q.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUZ3006jDu19Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUZ3002jDu19Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsanshebrew/v11/BCa5qYENg9Kw1mpLpO0bGM5lfHAAZHhDXEUZ3004jDs.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Sans Hebrew' as const;

type Variants = {
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic-ext' | 'hebrew' | 'latin' | 'latin-ext';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
