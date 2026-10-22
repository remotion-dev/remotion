import type {CanRenderIssue} from './can-render-types';
import type {WebRendererVideoCodec} from './mediabunny-mappings';

export const getEncodedDimensions = ({
	width,
	height,
	scale,
	codec,
}: {
	width: number;
	height: number;
	scale: number;
	codec: WebRendererVideoCodec | null;
}) => {
	const shouldHaveEvenDimensions =
		codec === 'h264' || codec === 'h265' || codec === 'av1';
	if (!shouldHaveEvenDimensions) {
		return {
			width: Math.ceil(width * scale),
			height: Math.ceil(height * scale),
		};
	}

	// Keep this calculation aligned with validateEvenDimensionsWithCodec() in
	// @remotion/renderer so client-side and server-side renders behave the same.
	let heightWithEvenDimensions = height;
	while (Math.round(heightWithEvenDimensions * scale) % 2 !== 0) {
		heightWithEvenDimensions--;
	}

	let widthWithEvenDimensions = width;
	while (Math.round(widthWithEvenDimensions * scale) % 2 !== 0) {
		widthWithEvenDimensions--;
	}

	return {
		width: Math.round(widthWithEvenDimensions * scale),
		height: Math.round(heightWithEvenDimensions * scale),
	};
};

export const validateDimensions = (options: {
	width: number;
	height: number;
	codec: WebRendererVideoCodec;
}): CanRenderIssue | null => {
	const {width, height, codec} = options;

	// H.264/H.265 require dimensions to be multiples of 2
	if (codec === 'h264' || codec === 'h265') {
		if (width % 2 !== 0 || height % 2 !== 0) {
			return {
				type: 'invalid-dimensions',
				message: `${codec.toUpperCase()} codec requires width and height to be multiples of 2. Got ${width}x${height}`,
				severity: 'error',
			};
		}
	}

	return null;
};
