import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Symbols',
	importName: 'NotoSansSymbols',
	version: 'v46',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		symbols:
			'U+0001-000C, U+000E-001F, U+007F-009F, U+20DD-20E0, U+20E2-20E4, U+2150-218F, U+2190, U+2192, U+2194-2199, U+21AF, U+21E6-21F0, U+21F3, U+2218-2219, U+2299, U+22C4-22C6, U+2300-243F, U+2440-244A, U+2460-24FF, U+25A0-27BF, U+2800-28FF, U+2921-2922, U+2981, U+29BF, U+29EB, U+2B00-2BFF, U+4DC0-4DFF, U+FFF9-FFFB, U+10140-1018E, U+10190-1019C, U+101A0, U+101D0-101FD, U+102E0-102FB, U+10E60-10E7E, U+1D2C0-1D2D3, U+1D2E0-1D37F, U+1F000-1F0FF, U+1F100-1F1AD, U+1F1E6-1F1FF, U+1F30D-1F30F, U+1F315, U+1F31C, U+1F31E, U+1F320-1F32C, U+1F336, U+1F378, U+1F37D, U+1F382, U+1F393-1F39F, U+1F3A7-1F3A8, U+1F3AC-1F3AF, U+1F3C2, U+1F3C4-1F3C6, U+1F3CA-1F3CE, U+1F3D4-1F3E0, U+1F3ED, U+1F3F1-1F3F3, U+1F3F5-1F3F7, U+1F408, U+1F415, U+1F41F, U+1F426, U+1F43F, U+1F441-1F442, U+1F444, U+1F446-1F449, U+1F44C-1F44E, U+1F453, U+1F46A, U+1F47D, U+1F4A3, U+1F4B0, U+1F4B3, U+1F4B9, U+1F4BB, U+1F4BF, U+1F4C8-1F4CB, U+1F4D6, U+1F4DA, U+1F4DF, U+1F4E3-1F4E6, U+1F4EA-1F4ED, U+1F4F7, U+1F4F9-1F4FB, U+1F4FD-1F4FE, U+1F503, U+1F507-1F50B, U+1F50D, U+1F512-1F513, U+1F53E-1F54A, U+1F54F-1F5FA, U+1F610, U+1F650-1F67F, U+1F687, U+1F68D, U+1F691, U+1F694, U+1F698, U+1F6AD, U+1F6B2, U+1F6B9-1F6BA, U+1F6BC, U+1F6C6-1F6CF, U+1F6D3-1F6D7, U+1F6E0-1F6EA, U+1F6F0-1F6F3, U+1F6F7-1F6FC, U+1F700-1F7FF, U+1F800-1F80B, U+1F810-1F847, U+1F850-1F859, U+1F860-1F887, U+1F890-1F8AD, U+1F8B0-1F8BB, U+1F8C0-1F8C1, U+1F900-1F90B, U+1F93B, U+1F946, U+1F984, U+1F996, U+1F9E9, U+1FA00-1FA6F, U+1FA70-1FA7C, U+1FA80-1FA89, U+1FA8F-1FAC6, U+1FACE-1FADC, U+1FADF-1FAE9, U+1FAF0-1FAF8, U+1FB00-1FBFF',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'200': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'300': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'400': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'500': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'600': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'700': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'800': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
			'900': {
				symbols:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzmVyK6L2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn1yK6L2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanssymbols/v46/rP2dp3q65FkAtHfwd-eIS2brbDN6gzn7yK4.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'symbols'],
});

export const fontFamily = 'Noto Sans Symbols' as const;

type Variants = {
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
		subsets: 'latin' | 'latin-ext' | 'symbols';
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
