import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'TinyFive',
	importName: 'Tiny5',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Tiny5:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		armenian: 'U+0308, U+0530-058F, U+2010, U+2024, U+25CC, U+FB13-FB17',
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'200': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'300': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'400': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'500': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'600': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'700': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'800': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
			'900': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcKsgW-DQ.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcXsgW-DQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcesgW-DQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcWsgW-DQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcZsgW-DQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcVsgW-DQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcUsgW-DQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOTCnmCvdGT7iw830dHx72MuMXnlYhOe0G_CY23xubcT-YMLkmpowcaCuG02no203t318zIrRh7-CcuMMtMlYcasgU.woff2',
			},
		},
		normal: {
			'100': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'200': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'300': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'400': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'500': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'600': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'700': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'800': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
			'900': {
				armenian:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImUwLcYqgE.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3bcYqgE.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU1LcYqgE.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3LcYqgE.woff2',
				greek:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU07cYqgE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU37cYqgE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU3rcYqgE.woff2',
				latin:
					'https://fonts.gstatic.com/s/tiny5/v4/KFOVCnmCvdGT7gY17YjFsqU5P8HylYh0cHNgqfzNZyHYWuYMFEKbbJNjBFkz328200F85S8o1EvtViA7-ImU0LcY.woff2',
			},
		},
	},
	subsets: [
		'armenian',
		'cyrillic',
		'cyrillic-ext',
		'greek',
		'greek-ext',
		'latin',
		'latin-ext',
		'vietnamese',
	],
	variable: {
		axes: {
			BLED: {
				min: 0,
				max: 100,
			},
			JITT: {
				min: 0,
				max: 100,
			},
			ROND: {
				min: 0,
				max: 100,
			},
			wdth: {
				min: 50,
				max: 200,
			},
			wght: {
				min: 100,
				max: 900,
			},
		},
		fontFaces: [
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'armenian',
				unicodeRange:
					'U+0308, U+0530-058F, U+2010, U+2024, U+25CC, U+FB13-FB17',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89VtvBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'cyrillic-ext',
				unicodeRange:
					'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89UZvBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'cyrillic',
				unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89U9vBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'greek-ext',
				unicodeRange: 'U+1F00-1FFF',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89UdvBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'greek',
				unicodeRange:
					'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89UhvBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89URvBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89UVvBg88.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOnCnmCvdGT7iw89UtvBg.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'armenian',
				unicodeRange:
					'U+0308, U+0530-058F, U+2010, U+2024, U+25CC, U+FB13-FB17',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iwpxUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'cyrillic-ext',
				unicodeRange:
					'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw0xUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'cyrillic',
				unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw9xUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'greek-ext',
				unicodeRange: 'U+1F00-1FFF',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw1xUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'greek',
				unicodeRange:
					'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw6xUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw2xUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw3xUl3Ag.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '50% 200%',
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/tiny5/v4/KFOpCnmCvdGT7iw5xUk.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=Tiny5:BLED,ital,JITT,ROND,wdth,wght@0..100,0,0..100,0..100,50..200,100..900;0..100,1,0..100,0..100,50..200,100..900',
	},
});

export const fontFamily = 'TinyFive' as const;

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
			| 'armenian'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
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
			| 'armenian'
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

type VariableVariants = {
	italic: {
		subsets:
			| 'armenian'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		subsets:
			| 'armenian'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
};

export const loadVariableFont = <T extends keyof VariableVariants>(
	style: T,
	options: {
		subsets: VariableVariants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadVariableFonts(getInfo(), style, options);
};
