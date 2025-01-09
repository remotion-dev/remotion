import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Anatolian Hieroglyphs',
	importName: 'NotoSansAnatolianHieroglyphs',
	version: 'v16',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Anatolian+Hieroglyphs:ital,wght@0,400',
	unicodeRanges: {
		'anatolian-hieroglyphs': 'U+14400-14646',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'anatolian-hieroglyphs':
					'https://fonts.gstatic.com/s/notosansanatolianhieroglyphs/v16/ijw9s4roRME5LLRxjsRb8A0gKPSWq4BbDmHHu6j2pEtUJzZWb4bj7moAWA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansanatolianhieroglyphs/v16/ijw9s4roRME5LLRxjsRb8A0gKPSWq4BbDmHHu6j2pEtUJzZWby_Cy1c5.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansanatolianhieroglyphs/v16/ijw9s4roRME5LLRxjsRb8A0gKPSWq4BbDmHHu6j2pEtUJzZWbyHCyw.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Sans Anatolian Hieroglyphs' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets: 'anatolian-hieroglyphs' | 'latin' | 'latin-ext';
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
