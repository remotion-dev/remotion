import {measureText} from '@remotion/layout-utils';
import {getTrajectory} from './get-trajectory';
import {
	LINE_WIDTH,
	PADDING_BOTTOM,
	PADDING_LEFT,
	PADDING_RIGHT,
	PADDING_TOP,
	drawTrajectory,
} from './draw-trajectory';
import type {DraggedConfig} from './types';

export let stopDrawing = () => {};

export const draw = ({
	ref,
	duration,
	fps,
	config,
	draggedConfig,
	draggedDuration,
	height,
	width,
	labelText,
}: {
	ref: HTMLCanvasElement;
	duration: number;
	fps: number;
	config: DraggedConfig;
	draggedConfig: DraggedConfig | null;
	draggedDuration: number | null;
	width: number;
	height: number;
	labelText: string;
}) => {
	const context = ref.getContext('2d');

	if (!context) {
		return;
	}

	context.clearRect(0, 0, width, height);
	const trajectory = getTrajectory(duration, fps, config);
	const draggedTrajectory = draggedConfig
		? getTrajectory(draggedDuration ?? duration, fps, draggedConfig)
		: [];

	const max = draggedConfig
		? Math.max(...draggedTrajectory)
		: Math.max(...trajectory);

	context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
	context.lineWidth = LINE_WIDTH * window.devicePixelRatio;
	context.lineCap = 'round';

	// Draw 0 line
	const zeroHeight = height - PADDING_BOTTOM;
	context.beginPath();
	context.moveTo(PADDING_LEFT, zeroHeight);
	context.lineTo(
		width -
			PADDING_RIGHT -
			measureText({
				fontFamily: 'GTPlanar',
				fontSize: 15,
				text: labelText,
				fontWeight: 'medium',
				letterSpacing: undefined,
			}).width -
			23 -
			16,
		zeroHeight,
	);
	context.stroke();
	context.closePath();

	// Draw 1 line
	const oneHeight =
		(height - PADDING_TOP - PADDING_BOTTOM) * (1 - 1 / max) + PADDING_TOP;
	context.beginPath();
	context.moveTo(PADDING_LEFT, oneHeight);
	context.lineTo(width - PADDING_RIGHT, oneHeight);
	context.stroke();
	context.closePath();

	const toStop: (() => void)[] = [];

	const stopPrimary = drawTrajectory({
		springTrajectory: trajectory,
		canvasHeight: height,
		canvasWidth: width,
		context,
		max,
		primary: !draggedConfig,
		animate: !draggedConfig,
		fps,
	});
	toStop.push(stopPrimary);

	if (draggedConfig) {
		toStop.push(
			drawTrajectory({
				springTrajectory: draggedTrajectory,
				canvasHeight: height,
				canvasWidth: width,
				context,
				max,
				primary: true,
				animate: false,
				fps,
			}),
		);
	}

	stopDrawing = () => {
		toStop.forEach((stop) => stop());
	};
};
