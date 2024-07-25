import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Ubuntu Mono',
	importName: 'UbuntuMono',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOhCneDtsqEr0keqCMhbCc_OsvSkLBP.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOhCneDtsqEr0keqCMhbCc_OsLSkLBP.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOhCneDtsqEr0keqCMhbCc_OsrSkLBP.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOhCneDtsqEr0keqCMhbCc_OsXSkLBP.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOhCneDtsqEr0keqCMhbCc_OsjSkLBP.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOhCneDtsqEr0keqCMhbCc_OsbSkA.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO8CneDtsqEr0keqCMhbCc_Mn33hYJufkO1.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO8CneDtsqEr0keqCMhbCc_Mn33hYtufkO1.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO8CneDtsqEr0keqCMhbCc_Mn33hYNufkO1.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO8CneDtsqEr0keqCMhbCc_Mn33hYxufkO1.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO8CneDtsqEr0keqCMhbCc_Mn33hYFufkO1.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO8CneDtsqEr0keqCMhbCc_Mn33hY9ufg.woff2',
			},
		},
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOjCneDtsqEr0keqCMhbCc3CsTKlA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOjCneDtsqEr0keqCMhbCc-CsTKlA.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOjCneDtsqEr0keqCMhbCc2CsTKlA.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOjCneDtsqEr0keqCMhbCc5CsTKlA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOjCneDtsqEr0keqCMhbCc0CsTKlA.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFOjCneDtsqEr0keqCMhbCc6CsQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO-CneDtsqEr0keqCMhbC-BL9H4tY12eg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO-CneDtsqEr0keqCMhbC-BL9HxtY12eg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO-CneDtsqEr0keqCMhbC-BL9H5tY12eg.woff2',
				greek:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO-CneDtsqEr0keqCMhbC-BL9H2tY12eg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO-CneDtsqEr0keqCMhbC-BL9H7tY12eg.woff2',
				latin:
					'https://fonts.gstatic.com/s/ubuntumono/v17/KFO-CneDtsqEr0keqCMhbC-BL9H1tY0.woff2',
			},
		},
	},
});

export const fontFamily = 'Ubuntu Mono' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext';
	};
	normal: {
		weights: '400' | '700';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext';
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
