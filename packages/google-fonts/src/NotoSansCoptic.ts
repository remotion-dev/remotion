import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Coptic',
	importName: 'NotoSansCoptic',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Coptic:ital,wght@0,400',
	unicodeRanges: {
		coptic:
			'U+0300-0302, U+0304-0305, U+0307-0308, U+0311, U+0323, U+033F, U+035E, U+0361, U+0374-0375, U+03E2-03EF, U+1DCD, U+2010, U+2053, U+2056, U+2058-2059, U+25CC, U+2C80-2CFF, U+2E17, U+2E33-2E34, U+FE24-FE26, U+102E0-102FB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				coptic:
					'https://fonts.gstatic.com/s/notosanscoptic/v21/iJWfBWmUZi_OHPqn4wq6kgqumOEd3-W1VV0x.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanscoptic/v21/iJWfBWmUZi_OHPqn4wq6kgqumOEd38K1VV0x.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanscoptic/v21/iJWfBWmUZi_OHPqn4wq6kgqumOEd38y1VQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Coptic' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'coptic' | 'latin' | 'latin-ext';
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
