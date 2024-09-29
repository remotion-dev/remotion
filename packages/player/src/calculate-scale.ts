import type {StandardLonghandProperties} from 'csstype';
import type {PreviewSize, VideoConfig} from 'remotion';
import {Internals} from 'remotion';
import {calculatePlayerSize} from './utils/calculate-player-size.js';
import type {Size} from './utils/use-element-size.js';

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
	const scale = Internals.calculateScale({
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
	overflowVisible,
	layout,
}: {
	config: VideoConfig | null;
	style: React.CSSProperties | undefined;
	canvasSize: Size | null;
	overflowVisible: boolean;
	layout: Layout | null;
}): React.CSSProperties => {
	if (!config) {
		return {};
	}

	return {
		position: 'relative',
		overflow: overflowVisible ? 'visible' : 'hidden',
		...calculatePlayerSize({
			compositionHeight: config.height,
			compositionWidth: config.width,
			currentSize: canvasSize,
			height: style?.height as StandardLonghandProperties['width'],
			width: style?.width as StandardLonghandProperties['height'],
		}),
		opacity: layout ? 1 : 0,
		...style,
	};
};

export const calculateContainerStyle = ({
	config,
	canvasSize,
	layout,
	scale,
	overflowVisible,
}: {
	config: VideoConfig | null;
	canvasSize: Size | null;
	layout: Layout | null;
	scale: number;
	overflowVisible: boolean;
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
		overflow: overflowVisible ? 'visible' : 'hidden',
	};
};

export const calculateOuter = ({
	layout,
	scale,
	config,
	overflowVisible,
}: {
	layout: Layout | null;
	scale: number;
	config: VideoConfig | null;
	overflowVisible: boolean;
}) => {
	if (!layout || !config) {
		return {} as const;
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
		overflow: overflowVisible ? 'visible' : 'hidden',
	} as const;
};
