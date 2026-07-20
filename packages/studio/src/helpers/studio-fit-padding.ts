import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import type {PreviewSize} from 'remotion';
import {Internals} from 'remotion';

export const STUDIO_FIT_PADDING = 16;

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

	return Internals.calculateScale({
		canvasSize: paddedCanvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	});
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
		return PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight,
			compositionWidth,
			previewSize,
		});
	}

	const {
		canvasSize: paddedCanvasSize,
		horizontalPadding,
		verticalPadding,
	} = getStudioPaddedCanvasSize(canvasSize);
	const transformation = PlayerInternals.calculateCanvasTransformation({
		canvasSize: paddedCanvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	});

	return {
		...transformation,
		centerX: transformation.centerX + horizontalPadding,
		centerY: transformation.centerY + verticalPadding,
	};
};
