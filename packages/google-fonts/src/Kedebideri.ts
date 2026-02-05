import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kedebideri',
	importName: 'Kedebideri',
	version: 'v6',
	url: 'https://fonts.googleapis.com/css2?family=Kedebideri:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		'beria-erfe': 'U+0301, U+16EA0-16EB8, U+16EBB-16ED3',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'beria-erfe':
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tlIR0UPo6ZGAykNh_evBjp7TzXqw.woff2',
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tlIR0UPo6ZGAykNh_evKHIyA.woff2',
			},
			'500': {
				'beria-erfe':
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etFLr3Yfuip6-ew.woff2',
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etFLr3T7Prw.woff2',
			},
			'600': {
				'beria-erfe':
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etH7s3Yfuip6-ew.woff2',
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etH7s3T7Prw.woff2',
			},
			'700': {
				'beria-erfe':
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etBrt3Yfuip6-ew.woff2',
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etBrt3T7Prw.woff2',
			},
			'800': {
				'beria-erfe':
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etAbu3Yfuip6-ew.woff2',
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etAbu3T7Prw.woff2',
			},
			'900': {
				'beria-erfe':
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etCLv3Yfuip6-ew.woff2',
				latin:
					'https://fonts.gstatic.com/s/kedebideri/v6/t5tmIR0UPo6ZGAykNh_etCLv3T7Prw.woff2',
			},
		},
	},
	subsets: ['beria-erfe', 'latin'],
});

export const fontFamily = 'Kedebideri' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'beria-erfe' | 'latin';
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
