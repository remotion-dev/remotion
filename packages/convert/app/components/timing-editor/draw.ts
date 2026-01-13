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
import type {TimingConfig} from './types';

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
	config: TimingConfig;
	draggedConfig: TimingConfig | null;
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

	const activeTrajectory = draggedConfig ? draggedTrajectory : trajectory;
	const max = Math.max(...activeTrajectory);
	const min = Math.min(...activeTrajectory);
	const range = max - min;

	context.strokeStyle = 'rgba(255, 255, 255, 0.05)';
	context.lineWidth = LINE_WIDTH * window.devicePixelRatio;
	context.lineCap = 'round';

	const getYForValue = (value: number) => {
		const normalizedValue = range === 0 ? 0.5 : (value - min) / range;
		return (
			(height - PADDING_TOP - PADDING_BOTTOM) * (1 - normalizedValue) +
			PADDING_TOP
		);
	};

	const lineEndX =
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
		16;

	// Draw 0 line (if 0 is within the range)
	if (min <= 0 && max >= 0) {
		const zeroHeight = getYForValue(0);
		context.beginPath();
		context.moveTo(PADDING_LEFT, zeroHeight);
		context.lineTo(lineEndX, zeroHeight);
		context.stroke();
		context.closePath();
	}

	// Draw 1 line (if 1 is within the range)
	if (min <= 1 && max >= 1) {
		const oneHeight = getYForValue(1);
		context.beginPath();
		context.moveTo(PADDING_LEFT, oneHeight);
		context.lineTo(width - PADDING_RIGHT, oneHeight);
		context.stroke();
		context.closePath();
	}

	const toStop: (() => void)[] = [];

	const stopPrimary = drawTrajectory({
		springTrajectory: trajectory,
		canvasHeight: height,
		canvasWidth: width,
		context,
		min,
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
				min,
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
