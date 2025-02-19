import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'BioRhyme',
	importName: 'BioRhyme',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=BioRhyme:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc0bOaRSs.woff2',
				latin:
					'https://fonts.gstatic.com/s/biorhyme/v17/1cXtaULHBpDMsHYW_GZNh7loEHurwOIGadIc37Oa.woff2',
			},
		},
	},
});

export const fontFamily = 'BioRhyme' as const;

type Variants = {
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'latin' | 'latin-ext';
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
