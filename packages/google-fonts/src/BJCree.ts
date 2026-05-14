import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'BJCree',
	importName: 'BJCree',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=BJCree:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'canadian-aboriginal':
			'U+02C7, U+02D8-02D9, U+02DB, U+0307, U+1400-167F, U+18B0-18F5, U+25CC, U+11AB0-11ABF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/bjcree/v3/QldPNTVAjTwa8_QKFDmUcXg.woff2',
				latin:
					'https://fonts.gstatic.com/s/bjcree/v3/QldPNTVAjTwa8_QKOzmU.woff2',
			},
			'500': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/bjcree/v3/QldMNTVAjTwa8_QCyBqBYVlb_qw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bjcree/v3/QldMNTVAjTwa8_QCyBqBTllb.woff2',
			},
			'600': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/bjcree/v3/QldMNTVAjTwa8_QC5B2BYVlb_qw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bjcree/v3/QldMNTVAjTwa8_QC5B2BTllb.woff2',
			},
			'700': {
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/bjcree/v3/QldMNTVAjTwa8_QCgByBYVlb_qw.woff2',
				latin:
					'https://fonts.gstatic.com/s/bjcree/v3/QldMNTVAjTwa8_QCgByBTllb.woff2',
			},
		},
	},
	subsets: ['canadian-aboriginal', 'latin'],
});

export const fontFamily = 'BJCree' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'canadian-aboriginal' | 'latin';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
