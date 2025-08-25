import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Literata',
	importName: 'Literata',
	version: 'v39',
	url: 'https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Z5ClqOw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Q5ClqOw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5Y5ClqOw.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5X5ClqOw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5b5ClqOw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5a5ClqOw.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or3yQ6P12-iJxAIgLYT1PLs1Zd0nfUwAbeGVKq5U5Ck.woff2',
			},
		},
		normal: {
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYZ5W_C0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlaJ5W_C0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYJ5W_C0.woff2',
				greek:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlb55W_C0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlY55W_C0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlYp5W_C0.woff2',
				latin:
					'https://fonts.gstatic.com/s/literata/v39/or38Q6P12-iJxAIgLa78DkrbXsDgk0oVDaDlbJ5W.woff2',
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
		'vietnamese',
	],
});

export const fontFamily = 'Literata' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
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
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
