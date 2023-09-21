import type {ColorSpace} from '@remotion/renderer';

let colorSpace: ColorSpace = 'default';

export const getColorSpace = (): ColorSpace => {
	return colorSpace;
};

export const setColorSpace = (size: ColorSpace) => {
	colorSpace = size;
};
