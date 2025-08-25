import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Ethiopic',
	importName: 'NotoSansEthiopic',
	version: 'v49',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		ethiopic:
			'U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7E6, U+1E7E8-1E7EB, U+1E7ED-1E7EE, U+1E7F0-1E7FE',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'200': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'300': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'400': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'500': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'600': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'700': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'800': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
			'900': {
				ethiopic:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4gckut2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hgkut2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansethiopic/v49/7cHAv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIv4hYkug.woff2',
			},
		},
	},
	subsets: ['ethiopic', 'latin', 'latin-ext'],
});

export const fontFamily = 'Noto Sans Ethiopic' as const;

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
		subsets: 'ethiopic' | 'latin' | 'latin-ext';
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
