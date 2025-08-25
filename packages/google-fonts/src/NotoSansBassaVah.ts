import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Bassa Vah',
	importName: 'NotoSansBassaVah',
	version: 'v20',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bassa+Vah:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'bassa-vah': 'U+25CC, U+16AD0-16AFF',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'bassa-vah':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLzxgdcNgpvw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz448VeUQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz4A8VQ.woff2',
			},
			'500': {
				'bassa-vah':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLzxgdcNgpvw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz448VeUQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz4A8VQ.woff2',
			},
			'600': {
				'bassa-vah':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLzxgdcNgpvw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz448VeUQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz4A8VQ.woff2',
			},
			'700': {
				'bassa-vah':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLzxgdcNgpvw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz448VeUQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansbassavah/v20/PN_sRee-r3f7LnqsD5sax12gjZn7mBpLz4A8VQ.woff2',
			},
		},
	},
	subsets: ['bassa-vah', 'latin', 'latin-ext'],
});

export const fontFamily = 'Noto Sans Bassa Vah' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'bassa-vah' | 'latin' | 'latin-ext';
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
