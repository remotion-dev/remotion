import type {Size} from '@remotion/player';
import {Internals, type PreviewSize, type Translation} from 'remotion';
import {MAX_ZOOM, MIN_ZOOM} from './smooth-zoom';
import {calculateStudioScale} from './studio-fit-padding';

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

export const getUnboundedCenterPointWhileScrolling = ({
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

	return {
		centerX: (mouseLeft - contentLeftPoint) / scale,
		centerY: (mouseTop - contentTopPoint) / scale,
	};
};

export const getCenterPointWhileScrolling = (
	options: Parameters<typeof getUnboundedCenterPointWhileScrolling>[0],
) => {
	const {centerX, centerY} = getUnboundedCenterPointWhileScrolling(options);

	return {
		centerX: Math.min(options.compositionWidth, Math.max(0, centerX)),
		centerY: Math.min(options.compositionHeight, Math.max(0, centerY)),
	};
};

export const applyZoomAroundFocalPoint = ({
	addFitPadding,
	canvasSize,
	contentDimensions,
	previewSizeBefore,
	oldNumericSize,
	newNumericSize,
	clientX,
	clientY,
}: {
	readonly addFitPadding: boolean;
	readonly canvasSize: Size;
	readonly contentDimensions: {width: number; height: number};
	readonly previewSizeBefore: PreviewSize;
	readonly oldNumericSize: number;
	readonly newNumericSize: number;
	readonly clientX: number;
	readonly clientY: number;
}): PreviewSize => {
	const scale = addFitPadding
		? calculateStudioScale({
				canvasSize,
				compositionHeight: contentDimensions.height,
				compositionWidth: contentDimensions.width,
				previewSize: previewSizeBefore.size,
			})
		: Internals.calculateScale({
				canvasSize,
				compositionHeight: contentDimensions.height,
				compositionWidth: contentDimensions.width,
				previewSize: previewSizeBefore.size,
			});

	const clampedNew = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newNumericSize));

	if (clampedNew === oldNumericSize) {
		return previewSizeBefore;
	}

	const {centerX, centerY} = getCenterPointWhileScrolling({
		size: canvasSize,
		clientX,
		clientY,
		compositionWidth: contentDimensions.width,
		compositionHeight: contentDimensions.height,
		scale,
		translation: previewSizeBefore.translation,
	});

	const zoomDifference = clampedNew - oldNumericSize;

	const uvCoordinatesX = centerX / contentDimensions.width;
	const uvCoordinatesY = centerY / contentDimensions.height;

	const correctionLeft =
		-uvCoordinatesX * (zoomDifference * contentDimensions.width) +
		(1 - uvCoordinatesX) * zoomDifference * contentDimensions.width;
	const correctionTop =
		-uvCoordinatesY * (zoomDifference * contentDimensions.height) +
		(1 - uvCoordinatesY) * zoomDifference * contentDimensions.height;

	return {
		size: clampedNew,
		translation: getEffectiveTranslation({
			translation: {
				x: previewSizeBefore.translation.x - correctionLeft / 2,
				y: previewSizeBefore.translation.y - correctionTop / 2,
			},
			canvasSize,
			compositionHeight: contentDimensions.height,
			compositionWidth: contentDimensions.width,
			scale,
		}),
	};
};
