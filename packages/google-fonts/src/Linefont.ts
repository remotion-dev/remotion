import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Linefont',
	importName: 'Linefont',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=Linefont:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {},
	fonts: {},
});

export const fontFamily = 'Linefont' as const;

type Variants = {};

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
