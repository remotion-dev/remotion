import type {Size} from '@remotion/player';
import type {Translation} from 'remotion';

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
	const maxTranslation = Math.abs(
		canvasSize.width / 2 +
			(scale * compositionWidth) / 2 -
			MUST_BE_INSIDE_CANVAS,
	);

	return Math.max(-maxTranslation, Math.min(translation.x, maxTranslation));
};

const MUST_BE_INSIDE_CANVAS = 50;

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
	const maxTranslation =
		Math.abs(canvasSize.height / 2 + (scale * compositionHeight) / 2) -
		MUST_BE_INSIDE_CANVAS;

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

export const getCenterPointWhileScrolling = ({
	size,
	clientX,
	clientY,
	compositionWidth,
	compositionHeight,
	scale,
	translation,
}: {
	size: Size;
	clientX: number;
	clientY: number;
	compositionWidth: number;
	compositionHeight: number;
	scale: number;
	translation: Translation;
}) => {
	const mouseLeft = clientX - size.left;
	const mouseTop = clientY - size.top;

	const contentLeftPoint =
		size.width / 2 - (compositionWidth * scale) / 2 - translation.x;
	const contentTopPoint =
		size.height / 2 - (compositionHeight * scale) / 2 - translation.y;

	const offsetFromVideoLeft = Math.min(
		compositionWidth,
		Math.max(0, (mouseLeft - contentLeftPoint) / scale),
	);
	const offsetFromVideoTop = Math.min(
		compositionHeight,
		Math.max(0, (mouseTop - contentTopPoint) / scale),
	);

	return {
		centerX: offsetFromVideoLeft,
		centerY: offsetFromVideoTop,
	};
};
