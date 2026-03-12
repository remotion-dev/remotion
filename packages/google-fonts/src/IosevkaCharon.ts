import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Iosevka Charon',
	importName: 'IosevkaCharon',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Iosevka+Charon:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700',
	unicodeRanges: {
		armenian: 'U+0308, U+0530-058F, U+2010, U+2024, U+25CC, U+FB13-FB17',
		braille: 'U+2800-28FF',
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		math: 'U+0302-0303, U+0305, U+0307-0308, U+0310, U+0312, U+0315, U+031A, U+0326-0327, U+032C, U+032F-0330, U+0332-0333, U+0338, U+033A, U+0346, U+034D, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2016-2017, U+2034-2038, U+203C, U+2040, U+2043, U+2047, U+2050, U+2057, U+205F, U+2070-2071, U+2074-208E, U+2090-209C, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2100-2112, U+2114-2115, U+2117-2121, U+2123-214F, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B7, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+3030, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF',
		symbols:
			'U+0001-000C, U+000E-001F, U+007F-009F, U+20DD-20E0, U+20E2-20E4, U+2150-218F, U+2190, U+2192, U+2194-2199, U+21AF, U+21E6-21F0, U+21F3, U+2218-2219, U+2299, U+22C4-22C6, U+2300-243F, U+2440-244A, U+2460-24FF, U+25A0-27BF, U+2800-28FF, U+2921-2922, U+2981, U+29BF, U+29EB, U+2B00-2BFF, U+4DC0-4DFF, U+FFF9-FFFB, U+10140-1018E, U+10190-1019C, U+101A0, U+101D0-101FD, U+102E0-102FB, U+10E60-10E7E, U+1D2C0-1D2D3, U+1D2E0-1D37F, U+1F000-1F0FF, U+1F100-1F1AD, U+1F1E6-1F1FF, U+1F30D-1F30F, U+1F315, U+1F31C, U+1F31E, U+1F320-1F32C, U+1F336, U+1F378, U+1F37D, U+1F382, U+1F393-1F39F, U+1F3A7-1F3A8, U+1F3AC-1F3AF, U+1F3C2, U+1F3C4-1F3C6, U+1F3CA-1F3CE, U+1F3D4-1F3E0, U+1F3ED, U+1F3F1-1F3F3, U+1F3F5-1F3F7, U+1F408, U+1F415, U+1F41F, U+1F426, U+1F43F, U+1F441-1F442, U+1F444, U+1F446-1F449, U+1F44C-1F44E, U+1F453, U+1F46A, U+1F47D, U+1F4A3, U+1F4B0, U+1F4B3, U+1F4B9, U+1F4BB, U+1F4BF, U+1F4C8-1F4CB, U+1F4D6, U+1F4DA, U+1F4DF, U+1F4E3-1F4E6, U+1F4EA-1F4ED, U+1F4F7, U+1F4F9-1F4FB, U+1F4FD-1F4FE, U+1F503, U+1F507-1F50B, U+1F50D, U+1F512-1F513, U+1F53E-1F54A, U+1F54F-1F5FA, U+1F610, U+1F650-1F67F, U+1F687, U+1F68D, U+1F691, U+1F694, U+1F698, U+1F6AD, U+1F6B2, U+1F6B9-1F6BA, U+1F6BC, U+1F6C6-1F6CF, U+1F6D3-1F6D7, U+1F6E0-1F6EA, U+1F6F0-1F6F3, U+1F6F7-1F6FC, U+1F700-1F7FF, U+1F800-1F80B, U+1F810-1F847, U+1F850-1F859, U+1F860-1F887, U+1F890-1F8AD, U+1F8B0-1F8BB, U+1F8C0-1F8C1, U+1F900-1F90B, U+1F93B, U+1F946, U+1F984, U+1F996, U+1F9E9, U+1FA00-1FA6F, U+1FA70-1FA7C, U+1FA80-1FA89, U+1FA8F-1FAC6, U+1FACE-1FADC, U+1FADF-1FAE9, U+1FAF0-1FAF8, U+1FB00-1FBFF',
		symbols2: 'U+2000-2001, U+2004-2008, U+200A, U+23B8-23BD, U+2500-259F',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKIsj-gx2.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKDUC3zFPJA.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJYj-gx2.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJ8j-gx2.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJcj-gx2.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJgj-gx2.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKOcj-gx2.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKPUj-gx2.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKCEC3zFPJA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJQj-gx2.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJUj-gx2.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYU0uKJsj-g.woff2',
			},
			'400': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFafYMPaQC.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaUgtGJk7_g.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaesMPaQC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaeIMPaQC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaeoMPaQC.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaeUMPaQC.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaZoMPaQC.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaYgMPaQC.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaVwtGJk7_g.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaekMPaQC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaegMPaQC.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xt0e-o8dtuW1FZBLWGprOon7cFaeYMPQ.woff2',
			},
			'500': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKIsj-gx2.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKDUC3zFPJA.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJYj-gx2.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJ8j-gx2.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJcj-gx2.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJgj-gx2.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKOcj-gx2.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKPUj-gx2.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKCEC3zFPJA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJQj-gx2.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJUj-gx2.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYRUvKJsj-g.woff2',
			},
			'700': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKIsj-gx2.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKDUC3zFPJA.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJYj-gx2.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJ8j-gx2.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJcj-gx2.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJgj-gx2.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKOcj-gx2.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKPUj-gx2.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKCEC3zFPJA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJQj-gx2.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJUj-gx2.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xq0e-o8dtuW1FZBLWGprOon7cFYV0pKJsj-g.woff2',
			},
		},
		normal: {
			'300': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_E7GJk7_g.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_GFObwGxzU.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_EmGJk7_g.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_EvGJk7_g.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_EnGJk7_g.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_EoGJk7_g.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_FXGJk7_g.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_FFGJk7_g.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_GRObwGxzU.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_EkGJk7_g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_ElGJk7_g.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-re_ErGJk.woff2',
			},
			'400': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cQWeQUOQ.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7eueMEpAJ0.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cNWeQUOQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cEWeQUOQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cMWeQUOQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cDWeQUOQ.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7d8WeQUOQ.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7duWeQUOQ.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7e6eMEpAJ0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cPWeQUOQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cOWeQUOQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xv0e-o8dtuW1FZBLWGprOon7cAWeQ.woff2',
			},
			'500': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevE7GJk7_g.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevGFObwGxzU.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevEmGJk7_g.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevEvGJk7_g.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevEnGJk7_g.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevEoGJk7_g.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevFXGJk7_g.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevFFGJk7_g.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevGRObwGxzU.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevEkGJk7_g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevElGJk7_g.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7_zevErGJk.woff2',
			},
			'700': {
				armenian:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPE7GJk7_g.woff2',
				braille:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPGFObwGxzU.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPEmGJk7_g.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPEvGJk7_g.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPEnGJk7_g.woff2',
				greek:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPEoGJk7_g.woff2',
				math: 'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPFXGJk7_g.woff2',
				symbols:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPFFGJk7_g.woff2',
				symbols2:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPGRObwGxzU.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPEkGJk7_g.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPElGJk7_g.woff2',
				latin:
					'https://fonts.gstatic.com/s/iosevkacharon/v1/f0Xs0e-o8dtuW1FZBLWGprOon7-7fPErGJk.woff2',
			},
		},
	},
	subsets: [
		'armenian',
		'braille',
		'cyrillic',
		'cyrillic-ext',
		'greek',
		'greek-ext',
		'latin',
		'latin-ext',
		'math',
		'symbols',
		'symbols2',
		'vietnamese',
	],
});

export const fontFamily = 'Iosevka Charon' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '700';
		subsets:
			| 'armenian'
			| 'braille'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'math'
			| 'symbols'
			| 'symbols2'
			| 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '500' | '700';
		subsets:
			| 'armenian'
			| 'braille'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'math'
			| 'symbols'
			| 'symbols2'
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
