import type {CropRectangle} from 'mediabunny';
import type {Dimensions} from './calculate-new-dimensions-from-dimensions';

export const applyCrop = (dimensions: Dimensions, cropRect: CropRectangle) => {
	return {
		width: Math.min(dimensions.width, cropRect.width - cropRect.left),
		height: Math.min(dimensions.height, cropRect.height - cropRect.top),
	};
};
