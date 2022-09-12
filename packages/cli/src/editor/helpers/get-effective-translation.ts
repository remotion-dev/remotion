import type {Size} from '@remotion/player';

const getEffectiveXTranslation = ({
	canvasSize,
	scale,
	compositionWidth,
	translation,
}: {
	canvasSize: Size;
	scale: number;
	compositionWidth: number;
	translation: {
		x: number;
		y: number;
	};
}) => {
	if (canvasSize.width >= scale * compositionWidth) {
		return 0;
	}

	const maxTranslation = Math.abs(
		(canvasSize.width - scale * compositionWidth) / 2
	);

	return Math.max(-maxTranslation, Math.min(translation.x, maxTranslation));
};

const getEffectiveYTranslation = ({
	canvasSize,
	scale,
	compositionHeight,
	translation,
}: {
	canvasSize: Size;
	scale: number;
	compositionHeight: number;
	translation: {
		x: number;
		y: number;
	};
}) => {
	if (canvasSize.height >= scale * compositionHeight) {
		return 0;
	}

	const maxTranslation = Math.abs(
		(canvasSize.height - scale * compositionHeight) / 2
	);

	return Math.max(-maxTranslation, Math.min(translation.y, maxTranslation));
};

export const getEffectiveTranslation = ({
	canvasSize,
	scale,
	compositionHeight,
	compositionWidth,
	translation,
}: {
	canvasSize: Size;
	scale: number;
	compositionWidth: number;
	compositionHeight: number;
	translation: {
		x: number;
		y: number;
	};
}) => {
	return {
		x: getEffectiveXTranslation({
			canvasSize,
			compositionWidth,
			scale,
			translation,
		}),
		y: getEffectiveYTranslation({
			canvasSize,
			compositionHeight,
			scale,
			translation,
		}),
	};
};
