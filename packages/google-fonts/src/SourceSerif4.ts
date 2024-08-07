import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Source Serif Four',
	importName: 'SourceSerif4',
	version: 'v8',
	url: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
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
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r3aX2AzA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r-aX2AzA.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r5aX2AzA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r1aX2AzA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r0aX2AzA.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFH2_tTDB4M7-auWDN0ahZJW1ge6NmXpVAHV83Bfb_US0r6aX0.woff2',
			},
		},
		normal: {
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAHr4cXk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kCXr4cXk.woff2',
				greek:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDnr4cXk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kAnr4cXk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kA3r4cXk.woff2',
				latin:
					'https://fonts.gstatic.com/s/sourceserif4/v8/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4.woff2',
			},
		},
	},
});

export const fontFamily = 'Source Serif Four' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
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
