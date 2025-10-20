import type {ConversionVideoOptions} from 'mediabunny';
import type {Dimensions} from './calculate-new-dimensions-from-dimensions';

export type MediabunnyResize =
	| {
			mode: 'scale';
			scale: number;
	  }
	| {
			mode: 'max-height';
			maxHeight: number;
	  }
	| {
			mode: 'max-width';
			maxWidth: number;
	  };

export const calculateMediabunnyResizeOption = (
	resizeOperation: MediabunnyResize | null,
	rotatedDimensions: Dimensions | null,
): ConversionVideoOptions => {
	if (resizeOperation === null) {
		return {};
	}

	if (rotatedDimensions === null) {
		return {};
	}

	if (resizeOperation.mode === 'scale') {
		return {
			height: rotatedDimensions.height * resizeOperation.scale,
		};
	}

	if (resizeOperation.mode === 'max-height') {
		return {
			height: Math.min(rotatedDimensions.height, resizeOperation.maxHeight),
		};
	}

	if (resizeOperation.mode === 'max-width') {
		return {
			width: Math.min(rotatedDimensions.width, resizeOperation.maxWidth),
		};
	}

	throw new Error('Unexpected resize operation ');
};
