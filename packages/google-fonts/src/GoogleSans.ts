import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Google Sans',
	importName: 'GoogleSans',
	version: 'v67',
	url: 'https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		armenian: 'U+0308, U+0530-058F, U+2010, U+2024, U+25CC, U+FB13-FB17',
		bengali:
			'U+0951-0952, U+0964-0965, U+0980-09FE, U+1CD0, U+1CD2, U+1CD5-1CD6, U+1CD8, U+1CE1, U+1CEA, U+1CED, U+1CF2, U+1CF5-1CF7, U+200C-200D, U+20B9, U+25CC, U+A8F1',
		'canadian-aboriginal':
			'U+02C7, U+02D8-02D9, U+02DB, U+0307, U+1400-167F, U+18B0-18F5, U+25CC, U+11AB0-11ABF',
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		devanagari:
			'U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09',
		ethiopic:
			'U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7E6, U+1E7E8-1E7EB, U+1E7ED-1E7EE, U+1E7F0-1E7FE',
		georgian:
			'U+0589, U+10A0-10FF, U+1C90-1CBA, U+1CBD-1CBF, U+205A, U+2D00-2D2F, U+2E31',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		gujarati:
			'U+0951-0952, U+0964-0965, U+0A80-0AFF, U+200C-200D, U+20B9, U+25CC, U+A830-A839',
		gurmukhi:
			'U+0951-0952, U+0964-0965, U+0A01-0A76, U+200C-200D, U+20B9, U+25CC, U+262C, U+A830-A839',
		hebrew:
			'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		khmer: 'U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC',
		lao: 'U+0E81-0EDF, U+200C-200D, U+25CC',
		malayalam:
			'U+0307, U+0323, U+0951-0952, U+0964-0965, U+0D00-0D7F, U+1CDA, U+1CF2, U+200C-200D, U+20B9, U+25CC, U+A830-A832',
		oriya:
			'U+0951-0952, U+0964-0965, U+0B01-0B77, U+1CDA, U+1CF2, U+200C-200D, U+20B9, U+25CC',
		sinhala:
			'U+0964-0965, U+0D81-0DF4, U+1CF2, U+200C-200D, U+25CC, U+111E1-111F4',
		symbols:
			'U+0001-000C, U+000E-001F, U+007F-009F, U+20DD-20E0, U+20E2-20E4, U+2150-218F, U+2190, U+2192, U+2194-2199, U+21AF, U+21E6-21F0, U+21F3, U+2218-2219, U+2299, U+22C4-22C6, U+2300-243F, U+2440-244A, U+2460-24FF, U+25A0-27BF, U+2800-28FF, U+2921-2922, U+2981, U+29BF, U+29EB, U+2B00-2BFF, U+4DC0-4DFF, U+FFF9-FFFB, U+10140-1018E, U+10190-1019C, U+101A0, U+101D0-101FD, U+102E0-102FB, U+10E60-10E7E, U+1D2C0-1D2D3, U+1D2E0-1D37F, U+1F000-1F0FF, U+1F100-1F1AD, U+1F1E6-1F1FF, U+1F30D-1F30F, U+1F315, U+1F31C, U+1F31E, U+1F320-1F32C, U+1F336, U+1F378, U+1F37D, U+1F382, U+1F393-1F39F, U+1F3A7-1F3A8, U+1F3AC-1F3AF, U+1F3C2, U+1F3C4-1F3C6, U+1F3CA-1F3CE, U+1F3D4-1F3E0, U+1F3ED, U+1F3F1-1F3F3, U+1F3F5-1F3F7, U+1F408, U+1F415, U+1F41F, U+1F426, U+1F43F, U+1F441-1F442, U+1F444, U+1F446-1F449, U+1F44C-1F44E, U+1F453, U+1F46A, U+1F47D, U+1F4A3, U+1F4B0, U+1F4B3, U+1F4B9, U+1F4BB, U+1F4BF, U+1F4C8-1F4CB, U+1F4D6, U+1F4DA, U+1F4DF, U+1F4E3-1F4E6, U+1F4EA-1F4ED, U+1F4F7, U+1F4F9-1F4FB, U+1F4FD-1F4FE, U+1F503, U+1F507-1F50B, U+1F50D, U+1F512-1F513, U+1F53E-1F54A, U+1F54F-1F5FA, U+1F610, U+1F650-1F67F, U+1F687, U+1F68D, U+1F691, U+1F694, U+1F698, U+1F6AD, U+1F6B2, U+1F6B9-1F6BA, U+1F6BC, U+1F6C6-1F6CF, U+1F6D3-1F6D7, U+1F6E0-1F6EA, U+1F6F0-1F6F3, U+1F6F7-1F6FC, U+1F700-1F7FF, U+1F800-1F80B, U+1F810-1F847, U+1F850-1F859, U+1F860-1F887, U+1F890-1F8AD, U+1F8B0-1F8BB, U+1F8C0-1F8C1, U+1F900-1F90B, U+1F93B, U+1F946, U+1F984, U+1F996, U+1F9E9, U+1FA00-1FA6F, U+1FA70-1FA7C, U+1FA80-1FA89, U+1FA8F-1FAC6, U+1FACE-1FADC, U+1FADF-1FAE9, U+1FAF0-1FAF8, U+1FB00-1FBFF',
		tamil: 'U+0964-0965, U+0B82-0BFA, U+200C-200D, U+20B9, U+25CC',
		telugu:
			'U+0951-0952, U+0964-0965, U+0C00-0C7F, U+1CDA, U+1CF2, U+200C-200D, U+25CC',
		thai: 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkr74vu-A.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrb4vu-A.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkkL4vu-A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksr4vu-A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQku74vu-A.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvr4vu-A.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrr4vu-A.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkoL4vu-A.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQks74vu-A.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvL4vu-A.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpL4vu-A.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQknL4vu-A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvb4vu-A.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktL4vu-A.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktr4vu-A.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkp74vu-A.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpr4vu-A.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkor4vu-A.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQk0b4vu-A.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkqb4vu-A.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQko74vu-A.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkq74vu-A.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksL4vu-A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksb4vu-A.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkv74v.woff2',
			},
			'500': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkr74vu-A.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrb4vu-A.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkkL4vu-A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksr4vu-A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQku74vu-A.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvr4vu-A.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrr4vu-A.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkoL4vu-A.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQks74vu-A.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvL4vu-A.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpL4vu-A.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQknL4vu-A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvb4vu-A.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktL4vu-A.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktr4vu-A.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkp74vu-A.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpr4vu-A.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkor4vu-A.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQk0b4vu-A.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkqb4vu-A.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQko74vu-A.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkq74vu-A.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksL4vu-A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksb4vu-A.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkv74v.woff2',
			},
			'600': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkr74vu-A.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrb4vu-A.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkkL4vu-A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksr4vu-A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQku74vu-A.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvr4vu-A.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrr4vu-A.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkoL4vu-A.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQks74vu-A.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvL4vu-A.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpL4vu-A.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQknL4vu-A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvb4vu-A.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktL4vu-A.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktr4vu-A.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkp74vu-A.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpr4vu-A.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkor4vu-A.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQk0b4vu-A.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkqb4vu-A.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQko74vu-A.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkq74vu-A.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksL4vu-A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksb4vu-A.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkv74v.woff2',
			},
			'700': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkr74vu-A.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrb4vu-A.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkkL4vu-A.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksr4vu-A.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQku74vu-A.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvr4vu-A.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkrr4vu-A.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkoL4vu-A.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQks74vu-A.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvL4vu-A.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpL4vu-A.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQknL4vu-A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkvb4vu-A.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktL4vu-A.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQktr4vu-A.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkp74vu-A.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkpr4vu-A.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkor4vu-A.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQk0b4vu-A.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkqb4vu-A.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQko74vu-A.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkq74vu-A.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksL4vu-A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQksb4vu-A.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UairENHsxJlGDuGo1OIlL3L2JB874GPhFI9_IqmuRqGpjeaLi42kO8QvnQkv74v.woff2',
			},
		},
		normal: {
			'400': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiIUvaYr.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiAUvaYr.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPh0UvaYr.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj8UvaYr.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjYUvaYr.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjMUvaYr.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiMUvaYr.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi0UvaYr.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj4UvaYr.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjEUvaYr.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPikUvaYr.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPhEUvaYr.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjAUvaYr.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjkUvaYr.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjsUvaYr.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPioUvaYr.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPisUvaYr.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi8UvaYr.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPlwUvaYr.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiQUvaYr.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi4UvaYr.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiYUvaYr.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj0UvaYr.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2',
			},
			'500': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiIUvaYr.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiAUvaYr.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPh0UvaYr.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj8UvaYr.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjYUvaYr.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjMUvaYr.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiMUvaYr.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi0UvaYr.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj4UvaYr.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjEUvaYr.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPikUvaYr.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPhEUvaYr.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjAUvaYr.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjkUvaYr.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjsUvaYr.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPioUvaYr.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPisUvaYr.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi8UvaYr.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPlwUvaYr.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiQUvaYr.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi4UvaYr.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiYUvaYr.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj0UvaYr.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2',
			},
			'600': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiIUvaYr.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiAUvaYr.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPh0UvaYr.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj8UvaYr.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjYUvaYr.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjMUvaYr.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiMUvaYr.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi0UvaYr.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj4UvaYr.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjEUvaYr.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPikUvaYr.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPhEUvaYr.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjAUvaYr.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjkUvaYr.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjsUvaYr.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPioUvaYr.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPisUvaYr.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi8UvaYr.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPlwUvaYr.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiQUvaYr.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi4UvaYr.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiYUvaYr.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj0UvaYr.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2',
			},
			'700': {
				armenian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiIUvaYr.woff2',
				bengali:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiAUvaYr.woff2',
				'canadian-aboriginal':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPh0UvaYr.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj8UvaYr.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjYUvaYr.woff2',
				devanagari:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjMUvaYr.woff2',
				ethiopic:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiMUvaYr.woff2',
				georgian:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi0UvaYr.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj4UvaYr.woff2',
				greek:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjEUvaYr.woff2',
				gujarati:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPikUvaYr.woff2',
				gurmukhi:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPhEUvaYr.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjAUvaYr.woff2',
				khmer:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjkUvaYr.woff2',
				lao: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjsUvaYr.woff2',
				malayalam:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPioUvaYr.woff2',
				oriya:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPisUvaYr.woff2',
				sinhala:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi8UvaYr.woff2',
				symbols:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPlwUvaYr.woff2',
				tamil:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiQUvaYr.woff2',
				telugu:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPi4UvaYr.woff2',
				thai: 'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPiYUvaYr.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPj0UvaYr.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2',
				latin:
					'https://fonts.gstatic.com/s/googlesans/v67/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2',
			},
		},
	},
	subsets: [
		'armenian',
		'bengali',
		'canadian-aboriginal',
		'cyrillic',
		'cyrillic-ext',
		'devanagari',
		'ethiopic',
		'georgian',
		'greek',
		'greek-ext',
		'gujarati',
		'gurmukhi',
		'hebrew',
		'khmer',
		'lao',
		'latin',
		'latin-ext',
		'malayalam',
		'oriya',
		'sinhala',
		'symbols',
		'tamil',
		'telugu',
		'thai',
		'vietnamese',
	],
});

export const fontFamily = 'Google Sans' as const;

type Variants = {
	italic: {
		weights: '400' | '500' | '600' | '700';
		subsets:
			| 'armenian'
			| 'bengali'
			| 'canadian-aboriginal'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'devanagari'
			| 'ethiopic'
			| 'georgian'
			| 'greek'
			| 'greek-ext'
			| 'gujarati'
			| 'gurmukhi'
			| 'hebrew'
			| 'khmer'
			| 'lao'
			| 'latin'
			| 'latin-ext'
			| 'malayalam'
			| 'oriya'
			| 'sinhala'
			| 'symbols'
			| 'tamil'
			| 'telugu'
			| 'thai'
			| 'vietnamese';
	};
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets:
			| 'armenian'
			| 'bengali'
			| 'canadian-aboriginal'
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'devanagari'
			| 'ethiopic'
			| 'georgian'
			| 'greek'
			| 'greek-ext'
			| 'gujarati'
			| 'gurmukhi'
			| 'hebrew'
			| 'khmer'
			| 'lao'
			| 'latin'
			| 'latin-ext'
			| 'malayalam'
			| 'oriya'
			| 'sinhala'
			| 'symbols'
			| 'tamil'
			| 'telugu'
			| 'thai'
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
