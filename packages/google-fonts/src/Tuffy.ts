import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tuffy',
	importName: 'Tuffy',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Tuffy:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		phoenician: 'U+10900-1091B, U+1091F',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLYJOzdYe.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLYtOzdYe.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLYNOzdYe.woff2',
				greek:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLYxOzdYe.woff2',
				phoenician:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLc9OzdYe.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLYFOzdYe.woff2',
				latin:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2GY56bHkJl7oxxLY9OzQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2OQ_gXzg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2O0_gXzg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2OU_gXzg.woff2',
				greek:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2Oo_gXzg.woff2',
				phoenician:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2Kk_gXzg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2Oc_gXzg.woff2',
				latin:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2DY56bHkJl7oxxJTRr2Ok_gQ.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7ox5HY1WyQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7oxwHY1WyQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7ox4HY1WyQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7ox3HY1WyQ.woff2',
				phoenician:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7ow0HY1WyQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7ox6HY1WyQ.woff2',
				latin: 'https://fonts.gstatic.com/s/tuffy/v1/1q2IY56bHkJl7ox0HY0.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJhk6OsnhQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJht6OsnhQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJhl6OsnhQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJhq6OsnhQ.woff2',
				phoenician:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJgp6OsnhQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJhn6OsnhQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tuffy/v1/1q2FY56bHkJl7oTPOJhp6Os.woff2',
			},
		},
	},
	subsets: [
		'cyrillic',
		'cyrillic-ext',
		'greek',
		'greek-ext',
		'latin',
		'latin-ext',
		'phoenician',
	],
});

export const fontFamily = 'Tuffy' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'phoenician';
	};
	normal: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'phoenician';
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
