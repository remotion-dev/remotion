import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif',
	importName: 'NotoSerif',
	version: 'v33',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		math: 'U+0302-0303, U+0305, U+0307-0308, U+0310, U+0312, U+0315, U+031A, U+0326-0327, U+032C, U+032F-0330, U+0332-0333, U+0338, U+033A, U+0346, U+034D, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2016-2017, U+2034-2038, U+203C, U+2040, U+2043, U+2047, U+2050, U+2057, U+205F, U+2070-2071, U+2074-208E, U+2090-209C, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2100-2112, U+2114-2115, U+2117-2121, U+2123-214F, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B7, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+3030, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Lct-FG.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3vct-FG.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Pct-FG.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3zct-FG.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_PwPct-FG.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Dct-FG.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3Hct-FG.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6faw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_P3_ctw.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf3D33Esw.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf-D33Esw.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf2D33Esw.woff2',
				greek:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf5D33Esw.woff2',
				math: 'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYeGD33Esw.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf1D33Esw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf0D33Esw.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserif/v33/ga6daw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTYf6D30.woff2',
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
		'math',
		'vietnamese',
	],
});

export const fontFamily = 'Noto Serif' as const;

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
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'math'
			| 'vietnamese';
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
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'math'
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
