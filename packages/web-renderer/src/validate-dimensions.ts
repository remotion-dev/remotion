import type {CanRenderIssue} from './can-render-types';
import type {WebRendererVideoCodec} from './mediabunny-mappings';

export const getEncodedDimensions = ({
	width,
	height,
	scale,
	codec,
	resizeToEvenDimensions,
}: {
	width: number;
	height: number;
	scale: number;
	codec: WebRendererVideoCodec | null;
	resizeToEvenDimensions: boolean;
}) => {
	const scaledWidth = Math.round(width * scale);
	const scaledHeight = Math.round(height * scale);
	const roundToEven =
		resizeToEvenDimensions && (codec === 'h264' || codec === 'h265');
	return {
		width: roundToEven ? Math.ceil(scaledWidth / 2) * 2 : scaledWidth,
		height: roundToEven ? Math.ceil(scaledHeight / 2) * 2 : scaledHeight,
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
