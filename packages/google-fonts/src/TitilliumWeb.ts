import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Titillium Web',
	importName: 'TitilliumWeb',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbewI1Db5yciWM.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbewI1DYZyc.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbepI5Db5yciWM.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbepI5DYZyc.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPAcZTIAOhVxoMyOr9n_E7fdMbWAaxWXr0.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPAcZTIAOhVxoMyOr9n_E7fdMbWD6xW.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbe0IhDb5yciWM.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbe0IhDYZyc.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbetIlDb5yciWM.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPFcZTIAOhVxoMyOr9n_E7fdMbetIlDYZyc.woff2',
			},
		},
		normal: {
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffAzHGIVzY4SY.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffAzHGItzYw.woff2',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffGjEGIVzY4SY.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffGjEGItzYw.woff2',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPecZTIAOhVxoMyOr9n_E7fdM3mDbRS.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPecZTIAOhVxoMyOr9n_E7fdMPmDQ.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGIVzY4SY.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGItzYw.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffHjDGIVzY4SY.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffHjDGItzYw.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffEDBGIVzY4SY.woff2',
				latin:
					'https://fonts.gstatic.com/s/titilliumweb/v17/NaPDcZTIAOhVxoMyOr9n_E7ffEDBGItzYw.woff2',
			},
		},
	},
});

export const fontFamily = 'Titillium Web' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '600' | '700';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '200' | '300' | '400' | '600' | '700' | '900';
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
