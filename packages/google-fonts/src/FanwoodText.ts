import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Fanwood Text',
	importName: 'FanwoodText',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Fanwood+Text:ital,wght@0,400;1,400',
	unicodeRanges: {
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/fanwoodtext/v15/3XFzErwl05Ad_vSCF6Fq7xX2R-zb_Pk.woff2',
			},
		},
		normal: {
			'400': {
				latin:
					'https://fonts.gstatic.com/s/fanwoodtext/v15/3XFtErwl05Ad_vSCF6Fq7xX2QtzZ.woff2',
			},
		},
	},
});

export const fontFamily = 'Fanwood Text' as const;

type Variants = {
	italic: {
		weights: '400';
		subsets: 'latin';
	};
	normal: {
		weights: '400';
		subsets: 'latin';
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
