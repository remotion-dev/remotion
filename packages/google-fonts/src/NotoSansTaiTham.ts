import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Tai Tham',
	importName: 'NotoSansTaiTham',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tai+Tham:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'tai-tham': 'U+1A20-1AAF, U+200C-200D, U+2219, U+25CC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'tai-tham':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5koJo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtBK5koJo.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtCq5k.woff2',
			},
			'500': {
				'tai-tham':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5koJo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtBK5koJo.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtCq5k.woff2',
			},
			'600': {
				'tai-tham':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5koJo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtBK5koJo.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtCq5k.woff2',
			},
			'700': {
				'tai-tham':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtQa5koJo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtBK5koJo.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanstaitham/v20/kJEuBv0U4hgtwxDUw2x9q7tbjLIfbPGtCq5k.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Tai Tham' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'tai-tham';
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
