import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Lisu Bosa',
	importName: 'LisuBosa',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Lisu+Bosa:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		lisu: 'U+02CD, U+2010, U+300A-300B, U+A4D0-A4FF, U+11FB0',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXkuROyd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXkuROzV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXkuROzb_Pk.woff2',
			},
			'300': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlKR-yd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlKR-zV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlKR-zb_Pk.woff2',
			},
			'400': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFuErkv240fsdmJRJQflXGnZfnk3Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFuErkv240fsdmJRJQflXHvZfnk3Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFuErkv240fsdmJRJQflXHhZfk.woff2',
			},
			'500': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXkSRuyd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXkSRuzV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXkSRuzb_Pk.woff2',
			},
			'600': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXk-Qeyd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXk-QezV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXk-Qezb_Pk.woff2',
			},
			'700': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlaQOyd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlaQOzV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlaQOzb_Pk.woff2',
			},
			'800': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlGQ-yd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlGQ-zV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXlGQ-zb_Pk.woff2',
			},
			'900': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXliQuyd_Plybg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXliQuzV_Plybg.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFzErkv240fsdmJRJQflXliQuzb_Pk.woff2',
			},
		},
		normal: {
			'200': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXX2D2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXX2D2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXX2D2QtzZ.woff2',
			},
			'300': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXO2P2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXO2P2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXO2P2QtzZ.woff2',
			},
			'400': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFoErkv240fsdmJRJQf1kHjff0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFoErkv240fsdmJRJQfnkHjff0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFoErkv240fsdmJRJQfkEHj.woff2',
			},
			'500': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXY2L2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXY2L2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXY2L2QtzZ.woff2',
			},
			'600': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXT2X2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXT2X2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXT2X2QtzZ.woff2',
			},
			'700': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXK2T2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXK2T2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXK2T2QtzZ.woff2',
			},
			'800': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXN2f2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXN2f2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXN2f2QtzZ.woff2',
			},
			'900': {
				lisu: 'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXE2b2BNzZ5P0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXE2b2TNzZ5P0.woff2',
				latin:
					'https://fonts.gstatic.com/s/lisubosa/v2/3XFtErkv240fsdmJRJQXE2b2QtzZ.woff2',
			},
		},
	},
});

export const fontFamily = 'Lisu Bosa' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'lisu';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'lisu';
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
