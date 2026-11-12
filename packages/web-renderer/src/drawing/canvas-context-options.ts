import type {InternalState} from '../internal-state';

const hasExactSolidGradient = (willReadFrequently: boolean) => {
	const canvas = new OffscreenCanvas(40, 40);
	try {
		const context = canvas.getContext('2d', {willReadFrequently});
		if (!context) return false;
		const gradient = context.createLinearGradient(0, 0, 40, 0);
		gradient.addColorStop(0, 'red');
		gradient.addColorStop(1, 'red');
		context.fillStyle = gradient;
		context.fillRect(0, 0, 40, 40);
		const {data} = context.getImageData(0, 0, 40, 40);
		for (let i = 0; i < data.length; i += 4) {
			if (
				data[i] !== 255 ||
				data[i + 1] !== 0 ||
				data[i + 2] !== 0 ||
				data[i + 3] !== 255
			)
				return false;
		}

		return true;
	} catch {
		// An unavailable readback probe must not prevent an otherwise valid render.
		return false;
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
};

export const getCanvasContextOptions = (
	internalState: InternalState,
	transparent: boolean,
): CanvasRenderingContext2DSettings => {
	const state = internalState.canvasContextState;
	if (state.willReadFrequently === null) {
		state.willReadFrequently =
			!hasExactSolidGradient(false) && hasExactSolidGradient(true);
	}

	return state.willReadFrequently
		? {alpha: transparent, willReadFrequently: true}
		: {alpha: transparent};
};
