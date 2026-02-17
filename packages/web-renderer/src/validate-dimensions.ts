import type {CanRenderIssue} from './can-render-types';
import type {WebRendererVideoCodec} from './mediabunny-mappings';

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
