import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Simonetta',
	importName: 'Simonetta',
	version: 'v27',
	url: 'https://fonts.googleapis.com/css2?family=Simonetta:ital,wght@0,400;0,900;1,400;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/simonetta/v27/x3dkckHVYrCU5BU15c4xfsoPlyvVBA.woff2',
				latin:
					'https://fonts.gstatic.com/s/simonetta/v27/x3dkckHVYrCU5BU15c4xfsoBlys.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/simonetta/v27/x3d5ckHVYrCU5BU15c4xfsKCsD7kJQYLGg.woff2',
				latin:
					'https://fonts.gstatic.com/s/simonetta/v27/x3d5ckHVYrCU5BU15c4xfsKCsD7qJQY.woff2',
			},
		},
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/simonetta/v27/x3dickHVYrCU5BU15c4xdfoDjy8.woff2',
				latin:
					'https://fonts.gstatic.com/s/simonetta/v27/x3dickHVYrCU5BU15c4xe_oD.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/simonetta/v27/x3dnckHVYrCU5BU15c45-N0Wvg7oPQI.woff2',
				latin:
					'https://fonts.gstatic.com/s/simonetta/v27/x3dnckHVYrCU5BU15c45-N0WsA7o.woff2',
			},
		},
	},
});

export const fontFamily = 'Simonetta' as const;

type Variants = {
	italic: {
		weights: '400' | '900';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '900';
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
