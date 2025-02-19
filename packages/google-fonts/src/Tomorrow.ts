import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tomorrow',
	importName: 'Tomorrow',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Tomorrow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLirETNbFtZCeGqgRXXQwHYJeCssE4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLirETNbFtZCeGqgRXXQwHYK-Cs.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ63JPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ63JPMeJjQ.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ8nKPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ8nKPMeJjQ.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLgrETNbFtZCeGqgRXXS2zoKfio.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLgrETNbFtZCeGqgRXXS2LoKQ.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ5HLPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ5HLPMeJjQ.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ73MPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ73MPMeJjQ.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ9nNPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ9nNPMeJjQ.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ8XOPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ8XOPMeJjQ.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ-HPPMmJjXd4.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLjrETNbFtZCeGqgRXXQ-HPPMeJjQ.woff2',
			},
		},
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLgrETNbFtZCeGqgR2xS2zoKfio.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLgrETNbFtZCeGqgR2xS2LoKQ.woff2',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR0dWnXBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR0dWnXPDMU.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR15WXXBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR15WXXPDMU.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLmrETNbFtZCeGqgRXce2DwLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLmrETNbFtZCeGqgRXSe2A.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR0hWHXBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR0hWHXPDMU.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR0NX3XBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR0NX3XPDMU.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR1pXnXBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR1pXnXPDMU.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR11XXXBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR11XXXPDMU.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR1RXHXBDMWRiQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tomorrow/v17/WBLhrETNbFtZCeGqgR1RXHXPDMU.woff2',
			},
		},
	},
});

export const fontFamily = 'Tomorrow' as const;

type Variants = {
	italic: {
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
		subsets: 'latin' | 'latin-ext';
	};
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
