import type {StandardLonghandProperties} from 'csstype';
import type {VideoConfig} from 'remotion';
import {calculatePlayerSize} from './utils/calculate-player-size';
import type {PreviewSize} from './utils/preview-size';
import type {Size} from './utils/use-element-size';

export const calculateScale = ({
	canvasSize,
	compositionHeight,
	compositionWidth,
	previewSize,
}: {
	previewSize: PreviewSize['size'];
	compositionWidth: number;
	compositionHeight: number;
	canvasSize: Size;
}) => {
	const heightRatio = canvasSize.height / compositionHeight;
	const widthRatio = canvasSize.width / compositionWidth;

	const ratio = Math.min(heightRatio, widthRatio);

	return previewSize === 'auto' ? ratio : Number(previewSize);
};

type Layout = {
	centerX: number;
	centerY: number;
	xCorrection: number;
	yCorrection: number;
	scale: number;
};

export const calculateCanvasTransformation = ({
	previewSize,
	compositionWidth,
	compositionHeight,
	canvasSize,
}: {
	previewSize: PreviewSize['size'];
	compositionWidth: number;
	compositionHeight: number;
	canvasSize: Size;
}): Layout => {
	const scale = calculateScale({
		canvasSize,
		compositionHeight,
		compositionWidth,
		previewSize,
	});

	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * compositionWidth;
	const yCorrection = correction * compositionHeight;
	const width = compositionWidth * scale;
	const height = compositionHeight * scale;
	const centerX = canvasSize.width / 2 - width / 2;
	const centerY = canvasSize.height / 2 - height / 2;
	return {
		centerX,
		centerY,
		xCorrection,
		yCorrection,
		scale,
	};
};

export const calculateOuterStyle = ({
	config,
	style,
	canvasSize,
}: {
	config: VideoConfig | null;
	style: React.CSSProperties | undefined;
	canvasSize: Size | null;
}): React.CSSProperties => {
	if (!config) {
		return {};
	}

	return {
		position: 'relative',
		overflow: 'hidden',
		...calculatePlayerSize({
			compositionHeight: config.height,
			compositionWidth: config.width,
			currentSize: canvasSize,
			height: style?.height as StandardLonghandProperties['width'],
			width: style?.width as StandardLonghandProperties['height'],
		}),
		...style,
	};
};

export const calculateContainerStyle = ({
	config,
	canvasSize,
	layout,
	scale,
}: {
	config: VideoConfig | null;
	canvasSize: Size | null;
	layout: Layout | null;
	scale: number;
}): React.CSSProperties => {
	if (!config || !canvasSize || !layout) {
		return {};
	}

	return {
		position: 'absolute',
		width: config.width,
		height: config.height,
		display: 'flex',
		transform: `scale(${scale})`,
		marginLeft: layout.xCorrection,
		marginTop: layout.yCorrection,
		overflow: 'hidden',
	};
};

export const calculateOuter = ({
	layout,
	scale,
	config,
}: {
	layout: Layout | null;
	scale: number;
	config: VideoConfig | null;
}): React.CSSProperties => {
	if (!layout || !config) {
		return {};
	}

	const {centerX, centerY} = layout;

	return {
		width: config.width * scale,
		height: config.height * scale,
		display: 'flex',
		flexDirection: 'column',
		position: 'absolute',
		left: centerX,
		top: centerY,
		overflow: 'hidden',
	};
};
