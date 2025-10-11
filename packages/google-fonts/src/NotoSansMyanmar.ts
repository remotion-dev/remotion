import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Myanmar',
	importName: 'NotoSansMyanmar',
	version: 'v21',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		myanmar:
			'U+1000-109F, U+200C-200D, U+25CC, U+A92E, U+A9E0-A9FE, U+AA60-AA7F, U+116D0-116E3, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZs_y1ZtY3ymOryg38hOCSdOnFq0HGS5vgQpw.woff2',
			},
			'200': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HE-9_Epgk0.woff2',
			},
			'300': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HFa9PEpgk0.woff2',
			},
			'400': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZq_y1ZtY3ymOryg38hOCSdOnFq0Hnv1uQ.woff2',
			},
			'500': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HEC9fEpgk0.woff2',
			},
			'600': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HEu8vEpgk0.woff2',
			},
			'700': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HFK8_Epgk0.woff2',
			},
			'800': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HFW8PEpgk0.woff2',
			},
			'900': {
				myanmar:
					'https://fonts.gstatic.com/s/notosansmyanmar/v21/AlZv_y1ZtY3ymOryg38hOCSdOnFq0HFy8fEpgk0.woff2',
			},
		},
	},
	subsets: ['myanmar'],
});

export const fontFamily = 'Noto Sans Myanmar' as const;

type Variants = {
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'myanmar';
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
