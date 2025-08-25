import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Tibetan',
	importName: 'NotoSerifTibetan',
	version: 'v23',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		tibetan: 'U+0F00-0FFF, U+200C-200D, U+25CC, U+3008-300B',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'200': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'300': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'400': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'500': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'600': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'700': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'800': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
			'900': {
				tibetan:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm2WY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbH8gm2WY.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoseriftibetan/v23/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbEcgm.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'tibetan'],
});

export const fontFamily = 'Noto Serif Tibetan' as const;

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
		subsets: 'latin' | 'latin-ext' | 'tibetan';
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
