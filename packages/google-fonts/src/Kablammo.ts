import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Kablammo',
	importName: 'Kablammo',
	version: 'v4',
	url: 'https://fonts.googleapis.com/css2?family=Kablammo:ital,wght@0,400',
	unicodeRanges: {
		'[2]':
			'U+23, U+2a, U+30-39, U+a9, U+ae, U+200d, U+203c, U+2049, U+20e3, U+2122, U+2139, U+2194-2199, U+21a9-21aa, U+23cf, U+23e9-23ef, U+23f8-23fa, U+24c2, U+25aa-25ab, U+25b6, U+25c0, U+25fb-25fe, U+2611, U+2622-2623, U+2626, U+262a, U+262e-262f, U+2638, U+2640, U+2642, U+2648-2653, U+2660, U+2663, U+2665-2666, U+2668, U+267b, U+267e-267f, U+2695, U+269b-269c, U+26a0, U+26a7, U+26aa-26ab, U+26ce, U+26d4, U+2705, U+2714, U+2716, U+271d, U+2721, U+2733-2734, U+2747, U+274c, U+274e, U+2753-2755, U+2757, U+2764, U+2795-2797, U+27a1, U+27b0, U+27bf, U+2934-2935, U+2b05-2b07, U+2b1b-2b1c, U+2b55, U+3030, U+303d, U+3297, U+3299, U+fe0f, U+1f170-1f171, U+1f17e-1f17f, U+1f18e, U+1f191-1f19a, U+1f201-1f202, U+1f21a, U+1f22f, U+1f232-1f23a, U+1f250-1f251, U+1f310, U+1f3a6, U+1f3b5-1f3b6, U+1f3bc, U+1f3e7, U+1f441, U+1f499-1f49c, U+1f49f-1f4a0, U+1f4a2, U+1f4ac-1f4ad, U+1f4b1-1f4b2, U+1f4b9, U+1f4db, U+1f4f2-1f4f6, U+1f500-1f50a, U+1f515, U+1f518-1f524, U+1f52f-1f53d, U+1f549, U+1f54e, U+1f5a4, U+1f5e8, U+1f5ef, U+1f6ab, U+1f6ad-1f6b1, U+1f6b3, U+1f6b7-1f6bc, U+1f6be, U+1f6c2-1f6c5, U+1f6d0-1f6d1, U+1f6d7, U+1f6dc, U+1f7e0-1f7eb, U+1f7f0, U+1f90d-1f90e, U+1f9e1, U+1fa75-1fa77, U+1faaf',
		'[3]':
			'U+231a-231b, U+2328, U+23f0-23f3, U+2602, U+260e, U+2692, U+2694, U+2696-2697, U+2699, U+26b0-26b1, U+26cf, U+26d1, U+26d3, U+2702, U+2709, U+270f, U+2712, U+fe0f, U+1f302, U+1f321, U+1f392-1f393, U+1f3a9, U+1f3bd, U+1f3ee, U+1f3f7, U+1f3fa, U+1f451-1f462, U+1f484, U+1f489-1f48a, U+1f48c-1f48e, U+1f4a1, U+1f4a3, U+1f4b0, U+1f4b3-1f4b8, U+1f4bb-1f4da, U+1f4dc-1f4f1, U+1f4ff, U+1f50b-1f514, U+1f516-1f517, U+1f526-1f529, U+1f52c-1f52e, U+1f550-1f567, U+1f56f-1f570, U+1f576, U+1f587, U+1f58a-1f58d, U+1f5a5, U+1f5a8, U+1f5b1-1f5b2, U+1f5c2-1f5c4, U+1f5d1-1f5d3, U+1f5dc-1f5de, U+1f5e1, U+1f5f3, U+1f6aa, U+1f6ac, U+1f6bd, U+1f6bf, U+1f6c1, U+1f6cb, U+1f6cd-1f6cf, U+1f6d2, U+1f6e0-1f6e1, U+1f6f0, U+1f97b-1f97f, U+1f9af, U+1f9ba, U+1f9e2-1f9e6, U+1f9ea-1f9ec, U+1f9ee-1f9f4, U+1f9f7-1f9ff, U+1fa71-1fa74, U+1fa79-1fa7b, U+1fa86, U+1fa91-1fa93, U+1fa96, U+1fa99-1faa0, U+1faa2-1faa7, U+1faaa-1faae',
		'[5]':
			'U+2693, U+26e9-26ea, U+26f1-26f2, U+26f4-26f5, U+26fa, U+26fd, U+2708, U+fe0f, U+1f301, U+1f303, U+1f306-1f307, U+1f309, U+1f310, U+1f3a0-1f3a2, U+1f3aa, U+1f3cd-1f3ce, U+1f3d5, U+1f3d7-1f3db, U+1f3df-1f3e6, U+1f3e8-1f3ed, U+1f3ef-1f3f0, U+1f488, U+1f492, U+1f4ba, U+1f54b-1f54d, U+1f5fa-1f5ff, U+1f680-1f6a2, U+1f6a4-1f6a8, U+1f6b2, U+1f6d1, U+1f6d5-1f6d6, U+1f6dd-1f6df, U+1f6e2-1f6e5, U+1f6e9, U+1f6eb-1f6ec, U+1f6f3-1f6f6, U+1f6f8, U+1f6fa-1f6fb, U+1f9bc-1f9bd, U+1f9ed, U+1f9f3, U+1fa7c',
		'[6]':
			'U+2615, U+fe0f, U+1f32d-1f330, U+1f336, U+1f33d, U+1f345-1f37f, U+1f382, U+1f52a, U+1f942-1f944, U+1f950-1f96f, U+1f99e, U+1f9aa, U+1f9c0-1f9cb, U+1fad0-1fadb',
		'[7]':
			'U+200d, U+2600-2601, U+2603-2604, U+2614, U+2618, U+26a1, U+26c4-26c5, U+26c8, U+26f0, U+2728, U+2744, U+2b1b, U+2b50, U+fe0f, U+1f300, U+1f304-1f305, U+1f308, U+1f30a-1f30f, U+1f311-1f321, U+1f324-1f32c, U+1f331-1f335, U+1f337-1f33c, U+1f33e-1f344, U+1f3d4, U+1f3d6, U+1f3dc-1f3de, U+1f3f5, U+1f400-1f43f, U+1f490, U+1f4a7, U+1f4ab, U+1f4ae, U+1f525, U+1f54a, U+1f573, U+1f577-1f578, U+1f648-1f64a, U+1f940, U+1f980-1f9ae, U+1f9ba, U+1fa90, U+1faa8, U+1fab0-1fabd, U+1fabf, U+1face-1facf, U+1fae7',
		'[9]':
			'U+200d, U+261d, U+2620, U+2639-263a, U+2665, U+270a-270d, U+2728, U+2763-2764, U+2b50, U+fe0f, U+1f31a-1f31f, U+1f32b, U+1f383, U+1f389, U+1f3fb-1f3ff, U+1f440-1f450, U+1f463-1f465, U+1f479-1f47b, U+1f47d-1f480, U+1f485, U+1f48b-1f48c, U+1f493-1f49f, U+1f4a4-1f4a6, U+1f4a8-1f4ab, U+1f4af, U+1f525, U+1f573, U+1f590, U+1f595-1f596, U+1f5a4, U+1f5e3, U+1f600-1f644, U+1f648-1f64a, U+1f64c, U+1f64f, U+1f90c-1f925, U+1f927-1f92f, U+1f932-1f933, U+1f970-1f976, U+1f978-1f97a, U+1f9a0, U+1f9b4-1f9b7, U+1f9bb, U+1f9be-1f9bf, U+1f9d0, U+1f9e0-1f9e1, U+1fa75-1fa79, U+1fac0-1fac2, U+1fae0-1fae6, U+1fae8, U+1faf0-1faf8',
		'[10]':
			'U+200d, U+2194-2195, U+2640, U+2642, U+26d3, U+27a1, U+fe0f, U+1f344, U+1f34b, U+1f3c3, U+1f3fb-1f3ff, U+1f426, U+1f468-1f469, U+1f4a5, U+1f525, U+1f642, U+1f6b6, U+1f7e9, U+1f7eb, U+1f9af, U+1f9bc-1f9bd, U+1f9ce, U+1f9d1-1f9d2',
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'[2]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.2.woff2',
				'[3]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.3.woff2',
				'[5]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.5.woff2',
				'[6]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.6.woff2',
				'[7]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.7.woff2',
				'[9]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.9.woff2',
				'[10]':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCjinUcfYJ-R_3eSwYL.10.woff2',
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCThRcQT4Y.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCTjBcQT4Y.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCThxcQT4Y.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCThhcQT4Y.woff2',
				latin:
					'https://fonts.gstatic.com/s/kablammo/v4/bWtm7fHPcgrhC-J3lcXhcQTY5Ixs6Au9YgCTiBcQ.woff2',
			},
		},
	},
	subsets: [
		'cyrillic',
		'cyrillic-ext',
		'emoji',
		'latin',
		'latin-ext',
		'vietnamese',
	],
});

export const fontFamily = 'Kablammo' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'emoji'
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
