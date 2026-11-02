import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import type {PreviewSize} from 'remotion';
import {Internals} from 'remotion';

export const STUDIO_FIT_PADDING = 8;

type CanvasSize = {
	readonly width: number;
	readonly height: number;
};

const getPadding = (length: number) => {
	return Math.min(STUDIO_FIT_PADDING, Math.max(0, (length - 1) / 2));
};

export const getStudioPaddedCanvasSize = <T extends CanvasSize>(
	canvasSize: T,
) => {
	const horizontalPadding = getPadding(canvasSize.width);
	const verticalPadding = getPadding(canvasSize.height);

	return {
		canvasSize: {
			...canvasSize,
			width: canvasSize.width - horizontalPadding * 2,
			height: canvasSize.height - verticalPadding * 2,
		},
		horizontalPadding,
		verticalPadding,
	};
};

export const getStudioCurrentScaleContext = (canvasSize: Size) => {
	return {
		type: 'canvas-size' as const,
		canvasSize,
		canvasSizeForAuto: getStudioPaddedCanvasSize(canvasSize).canvasSize,
	};
};

export const calculateStudioScale = ({
	canvasSize,
	compositionHeight,
	compositionWidth,
	previewSize,
}: {
	readonly canvasSize: CanvasSize;
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly previewSize: PreviewSize['size'];
}) => {
	const paddedCanvasSize = getStudioPaddedCanvasSize(canvasSize).canvasSize;

	const scale = Internals.calculateScale({
		canvasSize: paddedCanvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	});

	if (previewSize !== 'auto') {
		return scale;
	}

	// Chrome snaps the clip of promoted layers like <video> outwards to device
	// pixels while normal content is painted with partial coverage, so an edge
	// between device pixels leaks a 1px line of video next to a full-width bar.
	const devicePixelRatio = getDevicePixelRatio();
	return (
		Math.floor(scale * compositionHeight * devicePixelRatio) /
		(compositionHeight * devicePixelRatio)
	);
};

const getDevicePixelRatio = () => {
	if (typeof window === 'undefined') {
		return 1;
	}

	return window.devicePixelRatio || 1;
};

export const calculateStudioCanvasTransformation = ({
	canvasSize,
	compositionHeight,
	compositionWidth,
	previewSize,
}: {
	readonly canvasSize: Size;
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly previewSize: PreviewSize['size'];
}) => {
	if (previewSize !== 'auto') {
		const transformation = PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight,
			compositionWidth,
			previewSize,
		});
		return {
			centerX: transformation.centerX,
			centerY: transformation.centerY,
			scale: transformation.scale,
			scaleX: transformation.scale,
		};
	}

	const {
		canvasSize: paddedCanvasSize,
		horizontalPadding,
		verticalPadding,
	} = getStudioPaddedCanvasSize(canvasSize);
	const scale = calculateStudioScale({
		canvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	});
	const devicePixelRatio = getDevicePixelRatio();
	const snapToDevicePixel = (value: number) =>
		Math.round(value * devicePixelRatio) / devicePixelRatio;
	const scaleX =
		Math.floor(compositionWidth * scale * devicePixelRatio) /
		(compositionWidth * devicePixelRatio);

	return {
		centerX: snapToDevicePixel(
			paddedCanvasSize.width / 2 -
				(compositionWidth * scaleX) / 2 +
				horizontalPadding,
		),
		centerY: snapToDevicePixel(
			paddedCanvasSize.height / 2 -
				(compositionHeight * scale) / 2 +
				verticalPadding,
		),
		scale,
		scaleX,
	};
};
