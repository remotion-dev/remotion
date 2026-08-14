import type {EffectsOutputSize} from './props';

export const resolveEffectsOutputSize = ({
	sourceWidth,
	sourceHeight,
	effectsOutputSize,
}: {
	readonly sourceWidth: number;
	readonly sourceHeight: number;
	readonly effectsOutputSize: EffectsOutputSize | undefined;
}): EffectsOutputSize => {
	if (effectsOutputSize === undefined) {
		return {width: sourceWidth, height: sourceHeight};
	}

	const width = Math.round(effectsOutputSize.width);
	const height = Math.round(effectsOutputSize.height);

	if (
		!Number.isFinite(width) ||
		width <= 0 ||
		!Number.isFinite(height) ||
		height <= 0
	) {
		throw new TypeError(
			'`effectsOutputSize` width and height must be positive finite numbers.',
		);
	}

	return {width, height};
};
