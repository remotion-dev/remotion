import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Dai Banna SIL',
	importName: 'DaiBannaSIL',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Dai+Banna+SIL:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		'new-tai-lue': 'U+1980-19DF, U+200C-200D, U+25CC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyygsjwCysT15A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyygsjwNysT15A.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyygsjwOSsT.woff2',
			},
			'400': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-mwj0AJWmpwGyJ2uEoA4I7vSy6G-rlBgo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-mwj0AJWmpwGyJ2uEoA4I7vSy6J-rlBgo.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-mwj0AJWmpwGyJ2uEoA4I7vSy6Kerl.woff2',
			},
			'500': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyy2snwCysT15A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyy2snwNysT15A.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyy2snwOSsT.woff2',
			},
			'600': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyy9s7wCysT15A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyy9s7wNysT15A.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyy9s7wOSsT.woff2',
			},
			'700': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyyks_wCysT15A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyyks_wNysT15A.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-jwj0AJWmpwGyJ2uEoA4I7vSyyks_wOSsT.woff2',
			},
		},
		normal: {
			'300': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tYKoPv_AOzMX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tYKoPsPAOzMX.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tYKoPs3AOw.woff2',
			},
			'400': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-4wj0AJWmpwGyJ2uEoA4I7vRuKK_Lh.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-4wj0AJWmpwGyJ2uEoA4I7vSeKK_Lh.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-4wj0AJWmpwGyJ2uEoA4I7vSmKKw.woff2',
			},
			'500': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tdqpPv_AOzMX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tdqpPsPAOzMX.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tdqpPs3AOw.woff2',
			},
			'600': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tfauPv_AOzMX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tfauPsPAOzMX.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tfauPs3AOw.woff2',
			},
			'700': {
				'new-tai-lue':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tZKvPv_AOzMX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tZKvPsPAOzMX.woff2',
				latin:
					'https://fonts.gstatic.com/s/daibannasil/v2/lW-lwj0AJWmpwGyJ2uEoA4I7tZKvPs3AOw.woff2',
			},
		},
	},
});

export const fontFamily = 'Dai Banna SIL' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'new-tai-lue';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'new-tai-lue';
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
