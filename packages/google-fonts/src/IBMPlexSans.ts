import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Sans',
	importName: 'IBMPlexSans',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX8KVElMYYaJe8bpLHnCwDKhdTmdJZGUdLTDw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX8KVElMYYaJe8bpLHnCwDKhdTmdJZPUdLTDw.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX8KVElMYYaJe8bpLHnCwDKhdTmdJZIUdLTDw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX8KVElMYYaJe8bpLHnCwDKhdTmdJZEUdLTDw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX8KVElMYYaJe8bpLHnCwDKhdTmdJZFUdLTDw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX8KVElMYYaJe8bpLHnCwDKhdTmdJZLUdI.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm2Idce_fuNmo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm2IdccvfuNmo.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm2IdcdffuNmo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm2IdceffuNmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm2IdcePfuNmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm2Idcdvfu.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmvIRce_fuNmo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmvIRccvfuNmo.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmvIRcdffuNmo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmvIRceffuNmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmvIRcePfuNmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmvIRcdvfu.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKhdTuGqZJSdY.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKhdTuE6ZJSdY.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKhdTuFKZJSdY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKhdTuGKZJSdY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKhdTuGaZJSdY.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKhdTuF6ZJ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm5IVce_fuNmo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm5IVccvfuNmo.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm5IVcdffuNmo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm5IVceffuNmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm5IVcePfuNmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTm5IVcdvfu.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmyIJce_fuNmo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmyIJccvfuNmo.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmyIJcdffuNmo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmyIJceffuNmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmyIJcePfuNmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmyIJcdvfu.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmrINce_fuNmo.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmrINccvfuNmo.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmrINcdffuNmo.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmrINceffuNmo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmrINcePfuNmo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX7KVElMYYaJe8bpLHnCwDKhdTmrINcdvfu.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjbLuGqZJSdY.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjbLuE6ZJSdY.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjbLuFKZJSdY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjbLuGKZJSdY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjbLuGaZJSdY.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX-KVElMYYaJe8bpLHnCwDKjbLuF6ZJ.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjR7_AIxsdO_q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjR7_AIVsdO_q.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjR7_AIJsdO_q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjR7_AI5sdO_q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjR7_AI9sdO_q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjR7_AIFsdA.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjXr8AIxsdO_q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjXr8AIVsdO_q.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjXr8AIJsdO_q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjXr8AI5sdO_q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjXr8AI9sdO_q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjXr8AIFsdA.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdzeFb5N.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdXeFb5N.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdLeFb5N.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhd7eFb5N.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhd_eFb5N.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYXgKVElMYYaJe8bpLHnCwDKhdHeFQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIxsdO_q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIVsdO_q.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIJsdO_q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AI5sdO_q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AI9sdO_q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdA.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIxsdO_q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIVsdO_q.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIJsdO_q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AI5sdO_q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AI9sdO_q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIFsdA.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr7AIxsdO_q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr7AIVsdO_q.woff2',
				greek:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr7AIJsdO_q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr7AI5sdO_q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr7AI9sdO_q.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsans/v19/zYX9KVElMYYaJe8bpLHnCwDKjWr7AIFsdA.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Sans' as const;

type Variants = {
	italic: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
