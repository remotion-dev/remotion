import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kanchenjunga',
	importName: 'Kanchenjunga',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Kanchenjunga:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'kirat-rai': 'U+16D40-16D79',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'kirat-rai':
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmPoKKd5fUmrILiWsjCI6TSEaAiCVlq.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmPoKKd5fUmrILiWsjCI6TSroEH.woff2',
			},
			'500': {
				'kirat-rai':
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmQoKKd5fUmrILiWsjCI6TaXaIStGBLD2-V.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmQoKKd5fUmrILiWsjCI6TaXaISC0Fu.woff2',
			},
			'600': {
				'kirat-rai':
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmQoKKd5fUmrILiWsjCI6TacaUStGBLD2-V.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmQoKKd5fUmrILiWsjCI6TacaUSC0Fu.woff2',
			},
			'700': {
				'kirat-rai':
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmQoKKd5fUmrILiWsjCI6TaFaQStGBLD2-V.woff2',
				latin:
					'https://fonts.gstatic.com/s/kanchenjunga/v2/RWmQoKKd5fUmrILiWsjCI6TaFaQSC0Fu.woff2',
			},
		},
	},
	subsets: ['kirat-rai', 'latin'],
});

export const fontFamily = 'Kanchenjunga' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'kirat-rai' | 'latin';
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
