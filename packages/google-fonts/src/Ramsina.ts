import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Ramsina',
	importName: 'Ramsina',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Ramsina:ital,wght@0,400',
	unicodeRanges: {
		syriac:
			'U+0303-0304, U+0307-0308, U+030A, U+0320, U+0323-0325, U+032D-032E, U+0330-0331, U+060C, U+061B-061C, U+061F, U+0621, U+0640, U+064B-0655, U+0660-066C, U+0670, U+0700-074F, U+0860-086A, U+1DF8, U+1DFA, U+200C-200F, U+25CC, U+2670-2671',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				syriac:
					'https://fonts.gstatic.com/s/ramsina/v2/daaYSTE-LGmCbhP9yMo_QrmM.woff2',
				latin:
					'https://fonts.gstatic.com/s/ramsina/v2/daaYSTE-LGmCbhP9yLk_Qg.woff2',
			},
		},
	},
	subsets: ['latin', 'syriac'],
});

export const fontFamily = 'Ramsina' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'latin' | 'syriac';
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
