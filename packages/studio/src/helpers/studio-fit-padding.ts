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

	// The composition is scaled with a CSS transform, so a fractional fit scale
	// puts its bottom edge between device pixels. Chrome then snaps the clip of
	// promoted layers like <video> outwards while normal content is painted with
	// partial coverage, which leaks a 1px row of video below a full-width bar.
	// Round the fitted height down to whole device pixels to avoid this.
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
	// The fitted height is whole device pixels, but with the composition's
	// aspect ratio the width usually is not, which leaks a 1px column of video
	// next to a full-height bar at the right edge. Scale the width separately so
	// that it is whole device pixels too. The difference to `scale` is less than
	// one device pixel over the whole width, so the distortion is not visible.
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
