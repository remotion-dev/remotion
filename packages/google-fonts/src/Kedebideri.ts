import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kedebideri',
	importName: 'Kedebideri',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Kedebideri:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v2/t5tlIR0UPo6ZGAykNh_evKHIyA.woff2',
			},
			'500': {
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v2/t5tmIR0UPo6ZGAykNh_etFLr3T7Prw.woff2',
			},
			'600': {
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v2/t5tmIR0UPo6ZGAykNh_etH7s3T7Prw.woff2',
			},
			'700': {
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v2/t5tmIR0UPo6ZGAykNh_etBrt3T7Prw.woff2',
			},
			'800': {
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v2/t5tmIR0UPo6ZGAykNh_etAbu3T7Prw.woff2',
			},
			'900': {
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v2/t5tmIR0UPo6ZGAykNh_etCLv3T7Prw.woff2',
			},
		},
	},
	subsets: ['latin'],
});

export const fontFamily = 'Kedebideri' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin';
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
